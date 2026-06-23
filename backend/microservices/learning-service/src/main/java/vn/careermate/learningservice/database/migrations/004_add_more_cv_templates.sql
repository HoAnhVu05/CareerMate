-- Insert more diverse CV templates with better designs
-- Note: Use learningservice schema prefix for all tables
-- Template 4: Colorful - Creative
INSERT INTO learningservice.cv_templates (id, name, description, template_html, template_css, category, is_premium, created_at)
VALUES (
    gen_random_uuid(),
    'Mẫu CV Màu sắc - Sáng tạo',
    'Mẫu CV với màu sắc nổi bật, phù hợp cho ngành sáng tạo và thiết kế',
    $html4$<div class="cv-colorful">
  <div class="header-colorful">
    <div class="header-bg"></div>
    <div class="header-content">
      <div class="photo-wrapper-colorful">
        <img src="{{photoUrl}}" alt="Photo" class="photo-colorful" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''flex'';">
        <div class="photo-placeholder-colorful" style="display:none;">{{initials}}</div>
      </div>
      <h1 class="name-colorful">{{fullName}}</h1>
      <div class="contact-colorful">
        <span><i class="fas fa-envelope"></i> {{email}}</span>
        <span><i class="fas fa-phone"></i> {{phone}}</span>
        {{#if address}}<span><i class="fas fa-map-marker-alt"></i> {{address}}</span>{{/if}}
      </div>
      <div class="social-colorful">
        {{#if linkedin}}<a href="{{linkedin}}" class="social-link"><i class="fab fa-linkedin"></i></a>{{/if}}
        {{#if github}}<a href="{{github}}" class="social-link"><i class="fab fa-github"></i></a>{{/if}}
      </div>
    </div>
  </div>
  <div class="body-colorful">
    {{#if summary}}
    <section class="section-colorful">
      <h2 class="section-title-colorful"><i class="fas fa-user"></i> Giới thiệu</h2>
      <p class="section-text-colorful">{{summary}}</p>
    </section>
    {{/if}}
    {{#if experience.length}}
    <section class="section-colorful">
      <h2 class="section-title-colorful"><i class="fas fa-briefcase"></i> Kinh nghiệm</h2>
      {{#each experience}}
      <div class="item-colorful">
        <h3 class="item-title-colorful">{{position}}</h3>
        <p class="item-company-colorful">{{company}}</p>
        {{#if description}}<p class="item-desc-colorful">{{description}}</p>{{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}
    {{#if education.length}}
    <section class="section-colorful">
      <h2 class="section-title-colorful"><i class="fas fa-graduation-cap"></i> Học vấn</h2>
      {{#each education}}
      <div class="item-colorful">
        <h3 class="item-title-colorful">{{school}}</h3>
        <p class="item-company-colorful">{{major}}</p>
      </div>
      {{/each}}
    </section>
    {{/if}}
    {{#if skills.length}}
    <section class="section-colorful">
      <h2 class="section-title-colorful"><i class="fas fa-star"></i> Kỹ năng</h2>
      <div class="skills-grid-colorful">
        {{#each skills}}
        <div class="skill-item-colorful">{{this}}</div>
        {{/each}}
      </div>
    </section>
    {{/if}}
  </div>
</div>$html4$,
    $css4$@import url(''https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap'');
.cv-colorful { max-width: 850px; margin: 0 auto; font-family: ''Poppins'', sans-serif; background: white; box-shadow: 0 0 30px rgba(0,0,0,0.1); }
.header-colorful { position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 60px 40px 80px; color: white; text-align: center; }
.header-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url(''data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>''); opacity: 0.3; }
.header-content { position: relative; z-index: 1; }
.photo-wrapper-colorful { margin-bottom: 20px; }
.photo-colorful, .photo-placeholder-colorful { width: 150px; height: 150px; border-radius: 50%; border: 5px solid rgba(255,255,255,0.3); object-fit: cover; margin: 0 auto; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
.photo-placeholder-colorful { background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; display: flex; align-items: center; justify-content: center; font-size: 60px; font-weight: bold; }
.name-colorful { font-size: 42px; font-weight: 700; margin: 20px 0 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
.contact-colorful { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 14px; margin-bottom: 15px; opacity: 0.95; }
.contact-colorful i { margin-right: 5px; }
.social-colorful { display: flex; justify-content: center; gap: 15px; margin-top: 15px; }
.social-link { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s; }
.social-link:hover { background: rgba(255,255,255,0.3); transform: translateY(-3px); }
.body-colorful { padding: 40px; }
.section-colorful { margin-bottom: 35px; }
.section-title-colorful { font-size: 24px; font-weight: 600; color: #667eea; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #667eea; display: flex; align-items: center; gap: 10px; }
.section-title-colorful i { font-size: 20px; }
.section-text-colorful { line-height: 1.8; color: #555; font-size: 14px; }
.item-colorful { margin-bottom: 25px; padding-left: 25px; border-left: 3px solid #667eea; }
.item-title-colorful { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 5px; }
.item-company-colorful { font-size: 14px; color: #667eea; font-weight: 500; margin-bottom: 8px; }
.item-desc-colorful { font-size: 13px; line-height: 1.7; color: #666; margin-top: 8px; }
.skills-grid-colorful { display: flex; flex-wrap: wrap; gap: 10px; }
.skill-item-colorful { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; box-shadow: 0 2px 5px rgba(102,126,234,0.3); }$css4$,
    'CREATIVE',
    false,
    CURRENT_TIMESTAMP
);

-- Template 5: Elegant - Professional (Two-column layout)
INSERT INTO learningservice.cv_templates (id, name, description, template_html, template_css, category, is_premium, created_at)
VALUES (
    gen_random_uuid(),
    'Mẫu CV Thanh lịch - Chuyên nghiệp',
    'Mẫu CV hai cột, thanh lịch với bố cục cân đối và dễ đọc',
    $html5$<div class="cv-elegant">
  <div class="sidebar-elegant">
    <div class="photo-section-elegant">
      <img src="{{photoUrl}}" alt="Photo" class="photo-elegant" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''block'';">
      <div class="photo-placeholder-elegant" style="display:none;">{{initials}}</div>
    </div>
    <div class="sidebar-content-elegant">
      <div class="contact-block-elegant">
        <h3 class="block-title-elegant">Liên hệ</h3>
        <div class="contact-item-elegant"><i class="fas fa-envelope"></i> {{email}}</div>
        <div class="contact-item-elegant"><i class="fas fa-phone"></i> {{phone}}</div>
        {{#if address}}<div class="contact-item-elegant"><i class="fas fa-map-marker-alt"></i> {{address}}</div>{{/if}}
        {{#if linkedin}}<div class="contact-item-elegant"><i class="fab fa-linkedin"></i> <a href="{{linkedin}}">LinkedIn</a></div>{{/if}}
        {{#if github}}<div class="contact-item-elegant"><i class="fab fa-github"></i> <a href="{{github}}">GitHub</a></div>{{/if}}
      </div>
      {{#if skills.length}}
      <div class="skills-block-elegant">
        <h3 class="block-title-elegant">Kỹ năng</h3>
        {{#each skills}}
        <div class="skill-elegant">{{this}}</div>
        {{/each}}
      </div>
      {{/if}}
    </div>
  </div>
  <div class="main-elegant">
    <header class="header-elegant">
      <h1 class="name-elegant">{{fullName}}</h1>
      {{#if summary}}<p class="summary-elegant">{{summary}}</p>{{/if}}
    </header>
    {{#if experience.length}}
    <section class="section-elegant">
      <h2 class="section-title-elegant">Kinh nghiệm làm việc</h2>
      {{#each experience}}
      <div class="entry-elegant">
        <h3 class="entry-title-elegant">{{position}}</h3>
        <div class="entry-meta-elegant">{{company}}</div>
        {{#if description}}<p class="entry-desc-elegant">{{description}}</p>{{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}
    {{#if education.length}}
    <section class="section-elegant">
      <h2 class="section-title-elegant">Học vấn</h2>
      {{#each education}}
      <div class="entry-elegant">
        <h3 class="entry-title-elegant">{{school}}</h3>
        <div class="entry-meta-elegant">{{major}}</div>
      </div>
      {{/each}}
    </section>
    {{/if}}
  </div>
</div>$html5$,
    $css5$@import url(''https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Open+Sans:wght@300;400;600&display=swap'');
.cv-elegant { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 300px 1fr; font-family: ''Open Sans'', sans-serif; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.08); }
.sidebar-elegant { background: #2c3e50; color: white; padding: 40px 30px; }
.photo-section-elegant { margin-bottom: 30px; }
.photo-elegant, .photo-placeholder-elegant { width: 200px; height: 200px; border-radius: 10px; border: 4px solid rgba(255,255,255,0.2); object-fit: cover; margin: 0 auto; display: block; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
.photo-placeholder-elegant { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: white; display: flex; align-items: center; justify-content: center; font-size: 72px; font-weight: bold; font-family: ''Lora'', serif; }
.sidebar-content-elegant { }
.contact-block-elegant, .skills-block-elegant { margin-bottom: 35px; }
.block-title-elegant { font-size: 18px; font-weight: 600; font-family: ''Lora'', serif; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgba(255,255,255,0.3); }
.contact-item-elegant { font-size: 13px; line-height: 1.8; margin-bottom: 10px; opacity: 0.9; }
.contact-item-elegant i { width: 20px; margin-right: 8px; }
.contact-item-elegant a { color: white; text-decoration: underline; }
.skill-elegant { background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 8px; border-left: 3px solid rgba(255,255,255,0.5); }
.main-elegant { padding: 50px 45px; background: #f8f9fa; }
.header-elegant { margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #2c3e50; }
.name-elegant { font-size: 48px; font-weight: 700; font-family: ''Lora'', serif; color: #2c3e50; margin: 0 0 15px; }
.summary-elegant { font-size: 15px; line-height: 1.8; color: #555; font-style: italic; margin: 0; }
.section-elegant { margin-bottom: 40px; }
.section-title-elegant { font-size: 28px; font-weight: 600; font-family: ''Lora'', serif; color: #2c3e50; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
.entry-elegant { margin-bottom: 30px; padding: 20px; background: white; border-left: 4px solid #2c3e50; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.entry-title-elegant { font-size: 20px; font-weight: 600; color: #2c3e50; margin: 0 0 8px; }
.entry-meta-elegant { font-size: 14px; color: #7f8c8d; font-weight: 500; margin-bottom: 10px; }
.entry-desc-elegant { font-size: 14px; line-height: 1.7; color: #555; margin: 10px 0 0; }$css5$,
    'PROFESSIONAL',
    false,
    CURRENT_TIMESTAMP
);

-- Template 6: Modern Tech - Developer style
INSERT INTO learningservice.cv_templates (id, name, description, template_html, template_css, category, is_premium, created_at)
VALUES (
    gen_random_uuid(),
    'Mẫu CV Công nghệ - Lập trình viên',
    'Mẫu CV với phong cách hiện đại, phù hợp cho lập trình viên và kỹ sư phần mềm',
    $html6$<div class="cv-tech">
  <div class="header-tech">
    <div class="header-top-tech">
      <div class="photo-container-tech">
        <img src="{{photoUrl}}" alt="Photo" class="photo-tech" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''flex'';">
        <div class="photo-placeholder-tech" style="display:none;">{{initials}}</div>
      </div>
      <div class="header-info-tech">
        <h1 class="name-tech">{{fullName}}</h1>
        <div class="title-tech">Software Developer</div>
        <div class="contact-tech">
          <span><i class="fas fa-envelope"></i> {{email}}</span>
          <span><i class="fas fa-phone"></i> {{phone}}</span>
          {{#if address}}<span><i class="fas fa-map-marker-alt"></i> {{address}}</span>{{/if}}
        </div>
        <div class="links-tech">
          {{#if linkedin}}<a href="{{linkedin}}" class="link-tech"><i class="fab fa-linkedin"></i></a>{{/if}}
          {{#if github}}<a href="{{github}}" class="link-tech"><i class="fab fa-github"></i></a>{{/if}}
        </div>
      </div>
    </div>
  </div>
  <div class="content-tech">
    <div class="left-tech">
      {{#if summary}}
      <section class="section-tech">
        <h2 class="section-title-tech">About</h2>
        <p class="section-text-tech">{{summary}}</p>
      </section>
      {{/if}}
      {{#if experience.length}}
      <section class="section-tech">
        <h2 class="section-title-tech">Experience</h2>
        {{#each experience}}
        <div class="item-tech">
          <h3 class="item-title-tech">{{position}}</h3>
          <div class="item-meta-tech">{{company}}</div>
          {{#if description}}<p class="item-desc-tech">{{description}}</p>{{/if}}
        </div>
        {{/each}}
      </section>
      {{/if}}
      {{#if education.length}}
      <section class="section-tech">
        <h2 class="section-title-tech">Education</h2>
        {{#each education}}
        <div class="item-tech">
          <h3 class="item-title-tech">{{school}}</h3>
          <div class="item-meta-tech">{{major}}</div>
        </div>
        {{/each}}
      </section>
      {{/if}}
    </div>
    <div class="right-tech">
      {{#if skills.length}}
      <section class="section-tech">
        <h2 class="section-title-tech">Skills</h2>
        <div class="skills-list-tech">
          {{#each skills}}
          <div class="skill-tech">
            <span class="skill-dot"></span>
            {{this}}
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}
    </div>
  </div>
</div>$html6$,
    $css6$@import url(''https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Inter:wght@300;400;600;700&display=swap'');
.cv-tech { max-width: 950px; margin: 0 auto; font-family: ''Inter'', sans-serif; background: #0a0e27; color: #e0e0e0; }
.header-tech { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%); padding: 50px 40px; border-bottom: 4px solid #3b82f6; }
.header-top-tech { display: flex; gap: 30px; align-items: center; }
.photo-container-tech { flex-shrink: 0; }
.photo-tech, .photo-placeholder-tech { width: 140px; height: 140px; border-radius: 8px; border: 4px solid rgba(255,255,255,0.3); object-fit: cover; box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
.photo-placeholder-tech { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; display: flex; align-items: center; justify-content: center; font-size: 56px; font-weight: bold; font-family: ''Roboto Mono'', monospace; }
.header-info-tech { flex: 1; }
.name-tech { font-size: 38px; font-weight: 700; color: white; margin: 0 0 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
.title-tech { font-size: 16px; color: rgba(255,255,255,0.9); margin-bottom: 15px; font-weight: 500; }
.contact-tech { display: flex; gap: 20px; flex-wrap: wrap; font-size: 13px; color: rgba(255,255,255,0.85); margin-bottom: 12px; }
.contact-tech i { margin-right: 5px; }
.links-tech { display: flex; gap: 12px; margin-top: 12px; }
.link-tech { width: 36px; height: 36px; border-radius: 6px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.3s; }
.link-tech:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
.content-tech { display: grid; grid-template-columns: 1fr 280px; gap: 30px; padding: 40px; }
.left-tech { }
.right-tech { }
.section-tech { margin-bottom: 35px; }
.section-title-tech { font-size: 22px; font-weight: 700; font-family: ''Roboto Mono'', monospace; color: #60a5fa; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #1e3a8a; text-transform: uppercase; letter-spacing: 1px; }
.section-text-tech { font-size: 14px; line-height: 1.8; color: #b0b0b0; }
.item-tech { margin-bottom: 25px; padding: 20px; background: #151a35; border-left: 3px solid #3b82f6; border-radius: 4px; }
.item-title-tech { font-size: 18px; font-weight: 600; color: #fff; margin: 0 0 6px; }
.item-meta-tech { font-size: 13px; color: #60a5fa; font-weight: 500; margin-bottom: 10px; }
.item-desc-tech { font-size: 13px; line-height: 1.7; color: #b0b0b0; margin-top: 8px; }
.skills-list-tech { }
.skill-tech { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #e0e0e0; margin-bottom: 12px; padding: 8px; background: #151a35; border-radius: 4px; }
.skill-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; flex-shrink: 0; }$css6$,
    'TECH',
    false,
    CURRENT_TIMESTAMP
);
