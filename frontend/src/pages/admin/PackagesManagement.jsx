import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PackagesManagement() {
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [approvedSubscriptions, setApprovedSubscriptions] = useState([]);
  const [subscriptionsHistory, setSubscriptionsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [subscriptionTab, setSubscriptionTab] = useState('pending'); // 'pending', 'approved', 'history'
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    features: '',
    isActive: true
  });

  useEffect(() => {
    if (activeTab === 'packages') {
      loadPackages();
    } else if (activeTab === 'subscriptions') {
      if (subscriptionTab === 'pending') {
        loadSubscriptions();
      } else if (subscriptionTab === 'approved') {
        loadApprovedSubscriptions();
      } else if (subscriptionTab === 'history') {
        loadSubscriptionsHistory();
      }
    }
  }, [activeTab, subscriptionTab]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingSubscriptions(0, 100);
      if (data.content) {
        setSubscriptions(data.content);
      } else if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovedSubscriptions(0, 100);
      if (data.content) {
        setApprovedSubscriptions(data.content);
      } else if (Array.isArray(data)) {
        setApprovedSubscriptions(data);
      } else {
        setApprovedSubscriptions([]);
      }
    } catch (error) {
      console.error('Error loading approved subscriptions:', error);
      setApprovedSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionsHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getSubscriptionsHistory(0, 100);
      if (data.content) {
        setSubscriptionsHistory(data.content);
      } else if (Array.isArray(data)) {
        setSubscriptionsHistory(data);
      } else {
        setSubscriptionsHistory([]);
      }
    } catch (error) {
      console.error('Error loading subscriptions history:', error);
      setSubscriptionsHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (subscriptionId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt đăng ký này?')) return;
    try {
      await api.approveSubscription(subscriptionId);
      alert('Đã duyệt đăng ký thành công!');
      loadSubscriptions();
      if (subscriptionTab === 'approved') loadApprovedSubscriptions();
    } catch (error) {
      console.error('Error approving subscription:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể duyệt đăng ký'));
    }
  };

  const handleReject = async (subscriptionId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối đăng ký này?')) return;
    try {
      await api.rejectSubscription(subscriptionId);
      alert('Đã từ chối đăng ký!');
      loadSubscriptions();
      if (subscriptionTab === 'history') loadSubscriptionsHistory();
    } catch (error) {
      console.error('Error rejecting subscription:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể từ chối đăng ký'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const packageData = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingPackage) {
        await api.updatePackage(editingPackage.id, packageData);
        alert('Cập nhật gói thành công!');
      } else {
        await api.createPackage(packageData);
        alert('Tạo gói thành công!');
      }
      setShowForm(false);
      setEditingPackage(null);
      resetForm();
      loadPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể lưu gói'));
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price?.toString() || '',
      durationDays: pkg.durationDays?.toString() || '',
      features: pkg.features?.join(', ') || '',
      isActive: pkg.isActive !== undefined ? pkg.isActive : true
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (packageId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói này?')) return;
    try {
      await api.deletePackage(packageId);
      alert('Xóa gói thành công!');
      loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa gói'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      durationDays: '',
      features: '',
      isActive: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Đang đồng bộ dữ liệu dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Quản lý Gói Dịch Vụ</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Đối soát doanh thu và tối ưu hóa các tầng giá trị</p>
        </div>
        <div className="flex p-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[1.5rem] border border-white dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'packages'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
              : 'text-slate-500 hover:text-indigo-600'
              }`}
          >
            Quản lý Gói
          </button>
          <button
            onClick={() => { setActiveTab('subscriptions'); setSubscriptionTab('pending'); }}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'subscriptions'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
              : 'text-slate-500 hover:text-indigo-600'
              }`}
          >
            Duyệt Đăng Ký
          </button>
        </div>
      </div>

      {activeTab === 'packages' && (
        <div className="space-y-10">
          <div className="flex justify-end">
            <button
              onClick={() => { setShowForm(!showForm); setEditingPackage(null); resetForm(); }}
              className={`flex items-center gap-3 px-8 py-4 ${showForm ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'} rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:-translate-y-1`}
            >
              <i className={`fas ${showForm ? 'fa-times' : 'fa-plus-circle'}`}></i>
              <span>{showForm ? 'Hủy bỏ thiết lập' : 'Khởi tạo gói mới'}</span>
            </button>
          </div>

          {showForm && (
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl animate-slide-up">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <i className="fas fa-box-open"></i>
                </div>
                {editingPackage ? 'Cấu hình gói dịch vụ' : 'Định nghĩa gói sản phẩm'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Tên gọi thương mại</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all font-bold dark:text-white"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Đơn giá (VND)</label>
                  <input
                    type="number" required min="0" step="1000" value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all font-black text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Mô tả giá trị</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all font-medium dark:text-white min-h-[100px]"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Kỳ hạn (Số ngày hiệu lực)</label>
                  <input
                    type="number" required min="1" value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all font-bold dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox" checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">Kích hoạt gói</span>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Danh sách tính năng (phân cách dấu phẩy)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all font-medium dark:text-white min-h-[100px]"
                    placeholder="Premium Support, Unlimited CV, Priority Listing..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-4 pt-6">
                  <button type="submit" className="flex-1 px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 transition-all hover:brightness-110">
                    {editingPackage ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm mới'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/20">
                    <i className="fas fa-gem"></i>
                  </div>
                  {!pkg.isActive && <span className="px-4 py-1.5 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">Ngưng hỗ trợ</span>}
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{pkg.price?.toLocaleString('vi-VN')}</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">VND / {pkg.durationDays} Ngày</span>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{pkg.description}</p>
                  <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                  <ul className="space-y-3">
                    {pkg.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleEdit(pkg)} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:-translate-y-1 transition-all">
                    Chỉnh sửa
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="w-14 h-14 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-8">
          <div className="flex gap-4 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
            {[
              { id: 'pending', label: 'Chờ duyệt', icon: 'fa-clock' },
              { id: 'approved', label: 'Đang hoạt động', icon: 'fa-check-circle' },
              { id: 'history', label: 'Lịch sử', icon: 'fa-history' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubscriptionTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subscriptionTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md'
                  : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800'
                  }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khách hàng</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gói dịch vụ</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời điểm</th>
                    {subscriptionTab === 'pending' && <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Điều phối</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {((subscriptionTab === 'pending' ? subscriptions : subscriptionTab === 'approved' ? approvedSubscriptions : subscriptionsHistory)).map((sub) => (
                    <tr key={sub.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 uppercase text-xs">
                            {sub.user?.fullName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{sub.user?.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-400">{sub.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                          {sub.packageEntity?.name}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${sub.status === 'APPROVED' || sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' :
                          sub.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {sub.status === 'PENDING' ? 'Chờ kiểm duyệt' : sub.status === 'APPROVED' ? 'Đã kích hoạt' : 'Hết hạn/Khác'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">Từ: {formatDate(sub.startDate) || '---'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-opacity-60">Đến: {formatDate(sub.endDate) || '---'}</p>
                        </div>
                      </td>
                      {subscriptionTab === 'pending' && (
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleApprove(sub.id)} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform">
                              <i className="fas fa-check"></i>
                            </button>
                            <button onClick={() => handleReject(sub.id)} className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 hover:scale-110 transition-transform">
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {((subscriptionTab === 'pending' ? subscriptions : subscriptionTab === 'approved' ? approvedSubscriptions : subscriptionsHistory)).length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-32 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                          <i className="fas fa-inbox text-slate-200 text-3xl"></i>
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Không tìm thấy dữ liệu đối soát</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

