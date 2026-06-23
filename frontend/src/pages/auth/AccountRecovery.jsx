import { Link } from 'react-router-dom';

export default function AccountRecovery() {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 font-['Outfit']">
            <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>

            <div className="max-w-md w-full px-6 relative z-10">
                <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-6">
                        <i className="fas fa-user-shield text-3xl"></i>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Khôi phục tài khoản</h2>
                    <p className="text-slate-400 font-medium mb-8">Tính năng tự động khôi phục tài khoản đang được bảo trì. Vui lòng liên hệ Admin.</p>

                    <Link to="/login" className="block w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-lg transition-all">
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
