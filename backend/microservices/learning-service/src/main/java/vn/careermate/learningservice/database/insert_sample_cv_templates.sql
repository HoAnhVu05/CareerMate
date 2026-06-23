-- Insert sample CV templates
-- Template 1: Modern - Basic
INSERT INTO cv_templates (id, name, description, template_html, template_css, category, is_premium, created_at)
VALUES (
    gen_random_uuid(),
    'Mẫu CV Hiện đại - Cơ bản',
    'Mẫu CV hiện đại, chuyên nghiệp với thiết kế sạch sẽ và dễ đọc',
    $html1$<div class="cv-container">
  <div class="header-section">
    <div class="profile-photo">
      <img src="{{photoUrl}}" alt="Profile Photo" class="avatar" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''block'';">
      <div class="avatar-placeholder" style="display:none;">{{initials}}</div>
    </div>
    <h1 class="full-name">{{fullName}}</h1>
    <div class="contact-info">
      <span>{{email}}</span> | <span>{{phone}}</span>
      {{#if address}}| <span>{{address}}</span>{{/if}}
    </div>
    {{#if linkedin}}<div class="social-links"><a href="{{linkedin}}">LinkedIn</a></div>{{/if}}
    {{#if github}}<div class="social-links"><a href="{{github}}">GitHub</a></div>{{/if}}
  </div>
  {{#if summary}}
  <div class="section">
    <h2 class="section-title">Tóm tắt</h2>
    <p class="section-content">{{summary}}</p>
  </div>
  {{/if}}
  {{#if experience.length}}
  <div class="section">
    <h2 class="section-title">Kinh nghiệm làm việc</h2>
    {{#each experience}}
    <div class="experience-item">
      <h3 class="item-title">{{position}}</h3>
      <p class="item-company">{{company}}</p>
      {{#if description}}<p class="item-description">{{description}}</p>{{/if}}
    </div>
    {{/each}}
  </div>
  {{/if}}
  {{#if education.length}}
  <div class="section">
    <h2 class="section-title">Học vấn</h2>
    {{#each education}}
    <div class="education-item">
      <h3 class="item-title">{{school}}</h3>
      <p class="item-major">{{major}}</p>
    </div>
    {{/each}}
  </div>
  {{/if}}
  {{#if skills.length}}
  <div class="section">
    <h2 class="section-title">Kỹ năng</h2>
    <div class="skills-list">
      {{#each skills}}
      <span class="skill-tag">{{this}}</span>
      {{/each}}
    </div>
  </div>
  {{/if}}
</div>$html1$,
    $css1$.cv-container { max-width: 800px; margin: 0 auto; padding: 40px; font-family: Arial, sans-serif; background: white; }
.header-section { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
.profile-photo { margin-bottom: 15px; }
.avatar, .avatar-placeholder { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #3b82f6; margin: 0 auto; display: block; object-fit: cover; }
.avatar-placeholder { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; }
.full-name { font-size: 32px; font-weight: bold; color: #1f2937; margin: 15px 0 10px; }
.contact-info { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
.social-links { margin-top: 5px; }
.section { margin-bottom: 30px; }
.section-title { font-size: 20px; font-weight: bold; color: #3b82f6; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
.section-content { line-height: 1.6; color: #4b5563; }
.experience-item, .education-item { margin-bottom: 20px; }
.item-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
.item-company, .item-major { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
.item-description { color: #4b5563; font-size: 14px; line-height: 1.5; margin-top: 5px; }
.skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-tag { background: #e0e7ff; color: #4338ca; padding: 5px 12px; border-radius: 15px; font-size: 14px; }$css1$,
    'MODERN',
    false,
    CURRENT_TIMESTAMP
);

-- Template 2: Classic - Professional
INSERT INTO cv_templates (id, name, description, template_html, template_css, category, is_premium, created_at)
VALUES (
    gen_random_uuid(),
    'Mẫu CV Cổ điển - Chuyên nghiệp',
    'Mẫu CV cổ điển, phù hợp cho môi trường làm việc chuyên nghiệp',
    $html2$<div class="cv-container classic">
  <div class="header-classic">
    <div class="header-left">
      <h1 class="name-classic">{{fullName}}</h1>
      <div class="contact-classic">
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Điện thoại:</strong> {{phone}}</p>
        {{#if address}}<p><strong>Địa chỉ:</strong> {{address}}</p>{{/if}}
      </div>
    </div>
    <div class="header-right">
      <div class="photo-classic">
        <img src="{{photoUrl}}" alt="Photo" class="photo-img" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''flex'';">
        <div class="photo-placeholder" style="display:none;">{{initials}}</div>
      </div>
    </div>
  </div>
  {{#if summary}}
  <div class="section-classic">
    <h2 class="section-header-classic">Mục tiêu nghề nghiệp</h2>
    <p class="text-classic">{{summary}}</p>
  </div>
  {{/if}}
  {{#if experience.length}}
  <div class="section-classic">
    <h2 class="section-header-classic">Kinh nghiệm</h2>
    {{#each experience}}
    <div class="entry-classic">
      <div class="entry-header-classic">
        <strong>{{position}}</strong> - <em>{{company}}</em>
      </div>
      {{#if description}}<p class="text-classic">{{description}}</p>{{/if}}
    </div>
    {{/each}}
  </div>
  {{/if}}
  {{#if education.length}}
  <div class="section-classic">
    <h2 class="section-header-classic">Học vấn</h2>
    {{#each education}}
    <div class="entry-classic">
      <strong>{{school}}</strong>
      <p class="text-classic">{{major}}</p>
    </div>
    {{/each}}
  </div>
  {{/if}}
  {{#if skills.length}}
  <div class="section-classic">
    <h2 class="section-header-classic">Kỹ năng</h2>
    <ul class="skills-list-classic">
      {{#each skills}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/if}}
</div>$html2$,
    $css2$.cv-container.classic { max-width: 800px; margin: 0 auto; padding: 30px; font-family: "Times New Roman", serif; background: white; }
.header-classic { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 25px; }
.header-left { flex: 1; }
.name-classic { font-size: 28px; font-weight: bold; margin: 0 0 15px; }
.contact-classic p { margin: 5px 0; font-size: 12px; }
.header-right { margin-left: 30px; }
.photo-classic { width: 100px; height: 120px; }
.photo-img, .photo-placeholder { width: 100%; height: 100%; object-fit: cover; border: 2px solid #000; }
.photo-placeholder { background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; color: #6b7280; }
.section-classic { margin-bottom: 25px; }
.section-header-classic { font-size: 18px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 12px; }
.text-classic { line-height: 1.6; font-size: 13px; margin: 8px 0; }
.entry-classic { margin-bottom: 15px; }
.entry-header-classic { margin-bottom: 5px; font-size: 14px; }
.skills-list-classic { list-style: disc; padding-left: 25px; }
.skills-list-classic li { margin: 5px 0; font-size: 13px; }$css2$,
    'CLASSIC',
    false,
    CURRENT_TIMESTAMP
);

-- Template 3: Minimalist - Clean
INSERT INTO cv_templates (id, name, description, template_html, template_css, category, is_premium, created_at)
VALUES (
    gen_random_uuid(),
    'Mẫu CV Tối giản - Sạch sẽ',
    'Mẫu CV tối giản, sạch sẽ với nhiều khoảng trắng, dễ đọc',
    $html3$<div class="cv-minimal">
  <header class="header-minimal">
    <h1>{{fullName}}</h1>
    <div class="contact-minimal">{{email}} • {{phone}}{{#if address}} • {{address}}{{/if}}</div>
  </header>
  <div class="content-minimal">
    <div class="sidebar-minimal">
      <div class="photo-section-minimal">
        <img src="{{photoUrl}}" alt="Photo" class="photo-minimal" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''block'';">
        <div class="photo-fallback-minimal" style="display:none;">{{initials}}</div>
      </div>
      {{#if skills.length}}
      <div class="sidebar-block-minimal">
        <h3>Kỹ năng</h3>
        {{#each skills}}
        <div class="skill-minimal">{{this}}</div>
        {{/each}}
      </div>
      {{/if}}
    </div>
    <div class="main-minimal">
      {{#if summary}}
      <section class="block-minimal">
        <h2>Giới thiệu</h2>
        <p>{{summary}}</p>
      </section>
      {{/if}}
      {{#if experience.length}}
      <section class="block-minimal">
        <h2>Kinh nghiệm</h2>
        {{#each experience}}
        <div class="item-minimal">
          <h4>{{position}}</h4>
          <p class="meta-minimal">{{company}}</p>
          {{#if description}}<p class="desc-minimal">{{description}}</p>{{/if}}
        </div>
        {{/each}}
      </section>
      {{/if}}
      {{#if education.length}}
      <section class="block-minimal">
        <h2>Học vấn</h2>
        {{#each education}}
        <div class="item-minimal">
          <h4>{{school}}</h4>
          <p class="meta-minimal">{{major}}</p>
        </div>
        {{/each}}
      </section>
      {{/if}}
    </div>
  </div>
</div>$html3$,
    $css3$.cv-minimal { max-width: 900px; margin: 0 auto; padding: 50px; font-family: "Helvetica Neue", Arial, sans-serif; background: white; }
.header-minimal { text-align: center; margin-bottom: 50px; }
.header-minimal h1 { font-size: 36px; font-weight: 300; letter-spacing: 2px; margin: 0 0 10px; color: #2c3e50; }
.contact-minimal { font-size: 12px; color: #7f8c8d; letter-spacing: 1px; }
.content-minimal { display: grid; grid-template-columns: 250px 1fr; gap: 40px; }
.sidebar-minimal { border-right: 1px solid #ecf0f1; padding-right: 30px; }
.photo-section-minimal { margin-bottom: 40px; }
.photo-minimal, .photo-fallback-minimal { width: 180px; height: 180px; border-radius: 50%; object-fit: cover; margin: 0 auto; display: block; border: 1px solid #ecf0f1; }
.photo-fallback-minimal { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 72px; font-weight: 300; }
.sidebar-block-minimal { margin-bottom: 30px; }
.sidebar-block-minimal h3 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #95a5a6; margin-bottom: 15px; }
.skill-minimal { font-size: 12px; color: #34495e; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #ecf0f1; }
.main-minimal { }
.block-minimal { margin-bottom: 40px; }
.block-minimal h2 { font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #2c3e50; margin-bottom: 20px; border-bottom: 1px solid #ecf0f1; padding-bottom: 10px; }
.block-minimal p { font-size: 13px; line-height: 1.8; color: #7f8c8d; margin: 10px 0; }
.item-minimal { margin-bottom: 25px; }
.item-minimal h4 { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 5px; }
.meta-minimal { font-size: 12px; color: #95a5a6; font-style: italic; margin-bottom: 8px; }
.desc-minimal { font-size: 12px; line-height: 1.6; color: #7f8c8d; }$css3$,
    'MINIMALIST',
    false,
    CURRENT_TIMESTAMP
);
