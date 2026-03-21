import html
import json
import os
import re
from urllib.parse import quote

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PROJECTS_DIR = os.path.join(ROOT, 'Projects')
ARCHIVE_DIR = os.path.join(ROOT, 'Archive')
PHOTOGRAPHY_DIR = os.path.join(ROOT, 'photography')

PALETTE = ['#FF00D0', '#53FF45', '#1e2ede']
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg'}
VIDEO_EXTS = {'.mp4', '.webm', '.mov', '.m4v', '.ogv'}
DESCRIPTION_FILES = ['description.md', 'description.txt', 'info.txt', 'about.txt', 'README.md']
PAGE_CONFIG_FILE = 'page.json'
PROJECT_ORDER = [
    '2025 BrilliantBooks',
    '2025 Big summer energy',
    '2025 Colis Paris',
    '2025 Off all things bord ',
    '2025 Hotel Identity',
    '2024 Poster Party',
    '2024 Mars Attacks',
    '2024 YesYouCan',
]

TITLE_OVERRIDES = {
    '2025 BrilliantBooks': 'Brilliant Books',
    '2025 Big summer energy': 'Big Summer Energy',
    '2025 Colis Paris': 'Colis Paris',
    '2025 Off all things bord ': 'Of All Things: Bord',
    '2025 Hotel Identity': 'Hotel Identity',
}

MEDIA_SIZE_OVERRIDES = {
    'projects': {
        # '2025 BrilliantBooks': {
        #     'PortfolioFotos_Team6_1 groot.jpeg': 'large',
        #     'PortfolioFotos_Team6_10 groot.jpeg': 'small',
        # },
    },
    'archive': {
        # '2026': {
        #     '63.png': 'large',
        # },
    },
    'photography': {
        # 'Photo 2025': {
        #     'wildlife1.jpg': 'large',
        # },
    },
}


def read_dir_safe(path):
    try:
        return [entry for entry in os.scandir(path)]
    except FileNotFoundError:
        return []


def escape_html(value):
    return html.escape(value, quote=True)


def to_url_path(*parts):
    return '/'.join(quote(part) for part in parts)


def normalize_title(value):
    value = re.sub(r'[_-]+', ' ', value)
    value = re.sub(r'\s+', ' ', value)
    return value.strip()


def parse_folder_name(name):
    match = re.match(r'^(\d+)[-_ ]+(\d{4})[-_ ]+(.+)$', name)
    if match:
        return {
            'index': int(match.group(1)),
            'year': int(match.group(2)),
            'title': normalize_title(match.group(3)),
        }
    match = re.match(r'^(\d{4})[-_ ]+(.+)$', name)
    if match:
        return {
            'index': 0,
            'year': int(match.group(1)),
            'title': normalize_title(match.group(2)),
        }
    return {
        'index': 0,
        'year': 0,
        'title': normalize_title(name),
    }


def slugify(value):
    slug = re.sub(r'[^a-z0-9]+', '-', value.lower())
    slug = slug.strip('-')
    return slug or 'item'


def list_files(path):
    files = []
    for entry in read_dir_safe(path):
        if entry.is_file() and not entry.name.startswith('.'):
            files.append(entry.name)
    return sorted(files, key=natural_key)


def natural_key(value):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r'(\\d+)', value)]


def is_image(filename):
    _, ext = os.path.splitext(filename)
    return ext.lower() in IMAGE_EXTS


def read_description(path):
    for name in DESCRIPTION_FILES:
        full = os.path.join(path, name)
        if os.path.exists(full):
            with open(full, 'r', encoding='utf-8') as handle:
                return handle.read().strip()
    return ''


def read_page_config(path):
    full = os.path.join(path, PAGE_CONFIG_FILE)
    if not os.path.exists(full):
        return {}
    try:
        with open(full, 'r', encoding='utf-8') as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


def preview_image_path(project):
    preferred = project.get('page_config', {}).get('preview_image')
    if preferred:
        return preferred
    preview = project['images'][0] if project['images'] else ''
    return to_url_path('Projects', project['dir_name'], preview) if preview else ''


def homepage_images(project):
    preferred = project.get('page_config', {}).get('homepage_images')
    if not isinstance(preferred, list) or not preferred:
        return project['images'][:5]
    available = set(project['images'])
    selected = [file for file in preferred if file in available]
    return selected if selected else project['images'][:5]


def text_to_html(text):
    if not text:
        return ''
    escaped = escape_html(text)
    paragraphs = re.split(r'\n\s*\n', escaped)
    return '\n'.join(f"<p>{para.replace('\n', '<br>')}</p>" for para in paragraphs)


def normalize_media_size(value):
    return value if value in {'small', 'medium', 'large'} else 'medium'


def media_size_class(item_type, dir_name, file_name, configured_size=None):
    requested = configured_size or MEDIA_SIZE_OVERRIDES.get(item_type, {}).get(dir_name, {}).get(file_name)
    size = normalize_media_size(requested)
    return f"media-size-{size}"


def order_files_by_preference(files, preferred_order):
    if not isinstance(preferred_order, list) or not preferred_order:
        return files
    remaining = set(files)
    ordered = []
    for file in preferred_order:
        if file in remaining:
            ordered.append(file)
            remaining.remove(file)
    for file in files:
        if file in remaining:
            ordered.append(file)
            remaining.remove(file)
    return ordered


def build_items(base_dir, item_type):
    items = []
    for entry in read_dir_safe(base_dir):
        if not entry.is_dir():
            continue
        parsed = parse_folder_name(entry.name)
        page_config = read_page_config(entry.path) if item_type == 'projects' else {}
        ignored_files = set(page_config.get('ignored_files', [])) if item_type == 'projects' else set()
        files = [file for file in list_files(entry.path) if file != PAGE_CONFIG_FILE and file not in ignored_files]
        ordered_files = list(reversed(files)) if item_type in {'archive', 'photography'} else files
        images = [file for file in ordered_files if is_image(file)]
        other_files = [file for file in ordered_files if not is_image(file) and file not in DESCRIPTION_FILES]
        description = read_description(entry.path) if item_type == 'projects' else ''
        slug_base = f"{parsed['year'] or 0:04d}-{parsed['index'] or 0}-{parsed['title'] or entry.name}"
        items.append({
            'dir_name': entry.name,
            'title': parsed['title'] or entry.name,
            'year': parsed['year'],
            'index': parsed['index'],
            'slug': slugify(slug_base),
            'images': images,
            'other_files': other_files,
            'description': description,
            'page_config': page_config,
        })

    items.sort(key=lambda item: (-item['year'], -item['index'], item['title'].lower()))
    return items


def render_head(page_title):
    return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>{escape_html(page_title)}</title>
  <link rel=\"stylesheet\" media=\"screen\" href=\"https://fontlibrary.org//face/hk-grotesk\" type=\"text/css\" />
  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>
  <link href=\"https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double+Ink:wght@100..900&display=swap\" rel=\"stylesheet\">
  <link rel=\"stylesheet\" href=\"Css/style.css\">
</head>"""


def render_nav():
    return """
<header class=\"site-header\">
  <nav class=\"nav-bar\" data-nav>
    <button class=\"menu-toggle\" id=\"menu-toggle\" aria-controls=\"menu-panel\" aria-expanded=\"false\" type=\"button\">
      <span class=\"menu-icon\"></span>
      <span class=\"visually-hidden\">Menu</span>
    </button>
    <a class=\"site-title title-font\" href=\"index.html\">Jorne Scholiers</a>
    <div class=\"menu-spacer\"></div>
    <div class=\"menu-panel\" id=\"menu-panel\" role=\"menu\">
      <a role=\"menuitem\" href=\"about.html\">about</a>
      <a role=\"menuitem\" href=\"projects.html\">projects</a>
      <a role=\"menuitem\" href=\"archive.html\">archive</a>
    </div>
  </nav>
</header>"""


def render_intro():
    return """
<section class=\"intro\" id=\"intro\">
  <p>
    Hello,<br>
    My name is <a href=\"about.html\" class=\"intro-link\">Jorne Scholiers</a>, a Visual Design student at LUCA School of Arts Ghent.<br><br>
    I have some <a href=\"projects.html\">projects</a> you can look at, along with other work in my <a href=\"archive.html\">archive</a> that shows what I've been experimenting with.<br>
    Or maybe you will like some of my <a href=\"photography.html\">Photography</a>. Some of my projects appear on my <a href=\"https://www.instagram.com/byjorne/\" target=\"_blank\" rel=\"noopener\">Instagram</a>.<br><br>
    Don't hesitate to <a href=\"mailto:jorne.scholiers@icloud.com\">contact me</a>, I'd love to hear from you.<br>
    Oh and I am working on a little experimental <a href=\"https://overgrootoma.github.io/Accidental-Graphics/index.html?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn_xPN1gXGMxveV-2WBq2O8YHK8p9Uv3r8t5SqaQTupQLlJdervwptH_gk0B0_aem_uNEQtZRqNUCSIQz6gjrREw\" target=\"_blank\" rel=\"noopener\">site</a> as well :)
  </p>
</section>"""


def render_home(projects):
    rail_blocks = []
    for project in projects:
        preview_path = preview_image_path(project)
        rail_blocks.append(
            f"<a class=\"rail-block\" href=\"#project-{project['slug']}\" style=\"--rail-color: {project['accent']}\" "
            f"data-title=\"{escape_html(project['title'])}\" data-image=\"{preview_path}\" "
            f"aria-label=\"{escape_html(project['title'])}\"></a>"
        )

    sections = []
    for project in projects:
        images_html = []
        for idx, file in enumerate(homepage_images(project)):
            src = to_url_path('Projects', project['dir_name'], file)
            images_html.append(
                f"<img src=\"{src}\" alt=\"{escape_html(project['title'])} image {idx + 1}\" loading=\"lazy\" decoding=\"async\">"
            )
        images_block = '\n'.join(images_html) if images_html else '<div class="empty-state">No images yet.</div>'
        sections.append(f"""
      <article class=\"project-section\" id=\"project-{project['slug']}\">
        <div class=\"project-sticky\" style=\"--accent: {project['accent']}\">
          <h2 class=\"title-font\">{escape_html(project['title'])}</h2>
          <div class=\"project-meta\">{project.get('page_config', {}).get('meta', project['year'] or '')}</div>
          <a class=\"btn\" href=\"project-{project['slug']}.html\">extra info</a>
        </div>
        <div class=\"project-gallery\">
          {images_block}
        </div>
      </article>""")

    empty_state = '<div class="empty-state">Add folders inside the Projects directory to populate the onepager.</div>'

    return f"""
<main class=\"page-home\">
  {render_intro()}
  <aside class=\"project-rail\" aria-label=\"Project quick navigation\">
    {'\n'.join(rail_blocks) if rail_blocks else '<div class="rail-empty"></div>'}
  </aside>
  <div class=\"rail-preview\" id=\"rail-preview\">
    <div class=\"rail-preview-title\"></div>
    <img alt=\"Preview\" />
  </div>
  <section class=\"projects-onepager\" id=\"projects\">
    {('\n'.join(sections) if sections else empty_state)}
  </section>
  <a class=\"back-to-top\" href=\"#intro\">Back to top</a>
  <footer class=\"home-footer\">
    <div>Thank you for viewing my portfolio :)</div>
    <div>&copy; 2026 Jorne Scholiers. All rights reserved.</div>
  </footer>
</main>"""


def archive_sort_value(item):
    if item['year']:
        return item['year']
    match = re.search(r'\b(19|20)\d{2}\b', str(item['title']))
    return int(match.group(0)) if match else 0


def rail_text_color(accent):
    return 'rgba(235, 235, 235, 0.92)' if accent == '#1e2ede' else 'rgba(0, 0, 0, 0.75)'


ARCHIVE_SIZE_PATTERN = ['large', 'small', 'medium', 'medium', 'small', 'large', 'medium']


def collection_preview_path(base_dir_name, item):
    return to_url_path(base_dir_name, item['dir_name'], item['images'][0]) if item['images'] else ''


def collection_media_size_class(collection_type, item, file, index):
    configured = MEDIA_SIZE_OVERRIDES.get(collection_type, {}).get(item['dir_name'], {}).get(file)
    fallback = ARCHIVE_SIZE_PATTERN[index % len(ARCHIVE_SIZE_PATTERN)]
    return media_size_class(collection_type, item['dir_name'], file, configured or fallback)


def render_collection_index(items, heading, intro_text, top_link_href, top_link_label, rail_aria_label, section_prefix, base_dir_name, collection_type, preview_prefix, empty_state):
    ordered_items = sorted(
        items,
        key=lambda item: (archive_sort_value(item), item['index'], item['title']),
        reverse=True,
    )
    rail_links = []
    for item in ordered_items:
        year_label = archive_sort_value(item) or item['title']
        accent = item.get('accent', PALETTE[0])
        rail_links.append(
            f"<a class=\"archive-rail-block\" href=\"#{section_prefix}-{item['slug']}\" style=\"--rail-color: {accent}; --rail-text-color: {rail_text_color(accent)}\" data-title=\"{escape_html(preview_prefix)} {escape_html(str(year_label))}\" data-image=\"{collection_preview_path(base_dir_name, item)}\" aria-label=\"{escape_html(str(year_label))}\"><span>{escape_html(str(year_label))}</span></a>"
        )
    sections = []
    for item in ordered_items:
        accent = item.get('accent', PALETTE[0])
        marker_text = rail_text_color(accent)
        images = []
        for idx, file in enumerate(item['images']):
            src = to_url_path(base_dir_name, item['dir_name'], file)
            size_class = collection_media_size_class(collection_type, item, file, idx)
            images.append(f"""
      <figure class=\"{size_class}\">
        <div class=\"media-frame\">
          <img src=\"{src}\" alt=\"{escape_html(item['title'])} image {idx + 1}\" loading=\"lazy\" decoding=\"async\">
        </div>
      </figure>""")

        media_blocks = []
        download_links = []
        for file in item['other_files']:
            href = to_url_path(base_dir_name, item['dir_name'], file)
            ext = os.path.splitext(file)[1].lower()
            size_class = collection_media_size_class(collection_type, item, file, len(item['images']) + len(media_blocks) + len(download_links))
            if ext == '.pdf':
                media_blocks.append(f"""
      <figure class=\"media-card {size_class}\">
        <div class=\"media-frame\">
          <iframe class=\"media-embed media-embed--pdf\" src=\"{href}\" title=\"{escape_html(file)}\" loading=\"lazy\"></iframe>
        </div>
        <figcaption class=\"media-caption\">{escape_html(file)}</figcaption>
      </figure>""")
                continue
            if ext in VIDEO_EXTS:
                media_blocks.append(f"""
      <figure class=\"media-card {size_class}\">
        <div class=\"media-frame\">
          <video class=\"media-embed media-embed--video\" controls preload=\"metadata\">
            <source src=\"{href}\" type=\"video/{ext.lstrip('.')}\">
          </video>
        </div>
        <figcaption class=\"media-caption\">{escape_html(file)}</figcaption>
      </figure>""")
                continue
            download_links.append(f"<li><a href=\"{href}\" target=\"_blank\" rel=\"noopener\">{escape_html(file)}</a></li>")

        media_section = f"<section class=\"detail-media\">\n    {'\n'.join(media_blocks)}\n  </section>" if media_blocks else ''
        files_block = (
            f"<section class=\"detail-files\"><h3 class=\"title-font\">Files</h3><ul>{''.join(download_links)}</ul></section>"
            if download_links else ''
        )
        year_label = archive_sort_value(item) or item['title']
        gallery_html = '\n'.join(images) if images else '<div class="empty-state">No images yet.</div>'
        sections.append(f"""
    <article class=\"archive-entry\" id=\"{section_prefix}-{item['slug']}\" style=\"--archive-accent: {accent}; --archive-marker-text: {marker_text}\">
      <div class=\"archive-sticky\">
        <div class=\"archive-year-marker\">{escape_html(str(year_label))}</div>
      </div>
      <div class=\"archive-entry-content\">
        <section class=\"detail-gallery archive-entry-gallery\">
          {gallery_html}
        </section>
        {media_section}
        {files_block}
      </div>
    </article>""")
    sections_html = '\n'.join(sections)

    return f"""
<main class=\"page-archive\">
  <aside class=\"archive-rail\" aria-label=\"{escape_html(rail_aria_label)}\">
    {('\n'.join(rail_links) if rail_links else '<div class="rail-empty"></div>')}
  </aside>
  <div class=\"rail-preview\" id=\"rail-preview\">
    <div class=\"rail-preview-title\"></div>
    <img alt=\"Preview\" />
  </div>
  <section class=\"archive-intro\">
    <h1 class=\"title-font\">{escape_html(heading)}</h1>
    <p>{escape_html(intro_text)}</p>
    <a class=\"archive-top-link btn\" href=\"{top_link_href}\">{escape_html(top_link_label)}</a>
  </section>
  <section class=\"archive-list\">
    {sections_html or f'<div class="empty-state">{escape_html(empty_state)}</div>'}
  </section>
</main>"""


def render_archive_index(items):
    return render_collection_index(
        items,
        heading='Archive',
        intro_text='Experiments, drafts, and side quests.',
        top_link_href='photography.html',
        top_link_label='Photography',
        rail_aria_label='Archive years navigation',
        section_prefix='archive',
        base_dir_name='Archive',
        collection_type='archive',
        preview_prefix='Archive',
        empty_state='Add folders inside the Archive directory to populate this page.',
    )


def render_photography_index(items):
    return render_collection_index(
        items,
        heading='Photography',
        intro_text='Selected photography work and ongoing series.',
        top_link_href='archive.html',
        top_link_label='Archive',
        rail_aria_label='Photography years navigation',
        section_prefix='photography',
        base_dir_name='photography',
        collection_type='photography',
        preview_prefix='Photography',
        empty_state='Add folders inside the photography directory to populate this page.',
    )


def render_project_page(item, item_type):
    base = 'Projects' if item_type == 'projects' else 'Archive'
    title = escape_html(item['title'])
    page_config = item.get('page_config', {})
    gallery_class = page_config.get('gallery_class', 'detail-gallery') if item_type == 'projects' else 'detail-gallery'
    ordered_images = order_files_by_preference(item['images'], page_config.get('image_order')) if item_type == 'projects' else item['images']
    ordered_other_files = order_files_by_preference(item['other_files'], page_config.get('other_file_order')) if item_type == 'projects' else item['other_files']

    images = []
    for idx, file in enumerate(ordered_images):
        src = to_url_path(base, item['dir_name'], file)
        configured_size = page_config.get('image_sizes', {}).get(file) if item_type == 'projects' else None
        size_class = media_size_class(item_type, item['dir_name'], file, configured_size)
        caption = escape_html(page_config.get('captions', {}).get(file, file)) if item_type == 'projects' else escape_html(file)
        images.append(f"""
      <figure class=\"{size_class}\">
        <div class=\"media-frame\">
          <img src=\"{src}\" alt=\"{title} image {idx + 1}\" loading=\"lazy\" decoding=\"async\">
        </div>
        <figcaption>{caption}</figcaption>
      </figure>""")

    media_blocks = []
    download_links = []
    for file in ordered_other_files:
        href = to_url_path(base, item['dir_name'], file)
        _, ext = os.path.splitext(file)
        ext = ext.lower()
        configured_size = page_config.get('other_file_sizes', {}).get(file) if item_type == 'projects' else None
        size_class = media_size_class(item_type, item['dir_name'], file, configured_size)
        if item_type == 'projects':
            if ext in VIDEO_EXTS:
                media_blocks.append(f"""
      <figure class=\"media-card {size_class}\">
        <div class=\"media-frame\">
          <video class=\"media-embed media-embed--video\" controls preload=\"metadata\">
            <source src=\"{href}\" type=\"video/{ext[1:]}\">
          </video>
        </div>
        <figcaption class=\"media-caption\">{escape_html(page_config.get('captions', {}).get(file, file))}</figcaption>
      </figure>""")
                continue
            download_links.append(f"<li><a class=\"media-link\" href=\"{href}\" target=\"_blank\" rel=\"noopener\">Open {escape_html(file)}</a></li>")
            continue
        if ext == '.pdf':
            media_blocks.append(f"""
      <figure class=\"media-card {size_class}\">
        <div class=\"media-frame\">
          <iframe class=\"media-embed media-embed--pdf\" src=\"{href}\" title=\"{escape_html(file)}\" loading=\"lazy\"></iframe>
        </div>
        <figcaption class=\"media-caption\">{escape_html(file)}</figcaption>
      </figure>""")
            continue
        if ext in VIDEO_EXTS:
            media_blocks.append(f"""
      <figure class=\"media-card {size_class}\">
        <div class=\"media-frame\">
          <video class=\"media-embed media-embed--video\" controls preload=\"metadata\">
            <source src=\"{href}\" type=\"video/{ext[1:]}\">
          </video>
        </div>
        <figcaption class=\"media-caption\">{escape_html(file)}</figcaption>
      </figure>""")
            continue
        download_links.append(f"<li><a href=\"{href}\" target=\"_blank\" rel=\"noopener\">{escape_html(file)}</a></li>")

    description_html = text_to_html(item['description'] or 'Project information will be added here.') if item_type == 'projects' else ''
    description_block = f"<section class=\"detail-description\">{description_html}</section>" if description_html else ''
    back_link = "<a class=\"back-link\" href=\"index.html#projects\">&larr; Back to home</a>" if item_type == 'projects' else ''
    media_section = f"<section class=\"detail-media\">{''.join(media_blocks)}</section>" if media_blocks else ''
    files_block = (
        f"<section class=\"detail-files\"><ul>{''.join(download_links)}</ul></section>"
        if item_type == 'projects' and download_links else
        f"<section class=\"detail-files\"><h2 class=\"title-font\">Files</h2><ul>{''.join(download_links)}</ul></section>"
        if download_links else ''
    )
    meta_block = page_config.get('meta', item['year'] or '') if item_type == 'projects' else item['year'] or ''

    return f"""
<main class=\"page-detail\">
  <section class=\"detail-header\">
    {back_link}
    <h1 class=\"title-font\">{title}</h1>
    <div class=\"project-meta\">{meta_block}</div>
    {description_block}
  </section>
  <section class=\"{gallery_class}\">
    {(''.join(images) if images else '<div class="empty-state">No images yet.</div>')}
  </section>
  {media_section}
  {files_block}
</main>"""


def render_simple_page(heading, content):
    return f"""
<main class=\"page-simple\">
  <section class=\"simple-block\">
    <h1 class=\"title-font\">{escape_html(heading)}</h1>
    {content}
  </section>
</main>"""


def render_about_page():
    return """
<main class=\"page-simple\">
  <section class=\"simple-block\">
    <h1 class=\"title-font\">About</h1>
    <p>I&#39;m Jorne Scholiers, I am studying Visual Design at LUCA School of Arts in Ghent. My creative style is best described as abstract, experimental and bold. I&#39;ve always been drawn to visually dense work, the kind that invites you to look closer and keep discovering new details.</p>
    <p>I&#39;m always open to opportunities or collaborations. Feel free to contact me.</p>
    <p><a href=\"mailto:Jorne.Scholiers@icloud.com\">Jorne.Scholiers@icloud.com</a></p>
  </section>
  <div class=\"about-portrait\" tabindex=\"0\" aria-label=\"Portrait of Jorne Scholiers\">
    <img class=\"about-portrait-base\" src=\"images/ME%20Blurred.jpg\" alt=\"Blurred portrait of Jorne Scholiers\" loading=\"lazy\" decoding=\"async\">
    <img class=\"about-portrait-hover\" src=\"images/ME.jpg\" alt=\"Portrait of Jorne Scholiers\" loading=\"lazy\" decoding=\"async\">
  </div>
</main>"""


def render_layout(title, body_class, main):
    return f"{render_head(title)}\n<body class=\"{body_class}\">\n  {render_nav()}\n  {main}\n  <script src=\"Scripts/site.js\" defer></script>\n</body>\n</html>"


def write_file(name, content):
    with open(os.path.join(ROOT, name), 'w', encoding='utf-8') as handle:
        handle.write(content)


def build_site():
    projects = build_items(PROJECTS_DIR, 'projects')
    archive = build_items(ARCHIVE_DIR, 'archive')
    photography = build_items(PHOTOGRAPHY_DIR, 'photography')

    for project in projects:
        override = TITLE_OVERRIDES.get(project['dir_name'])
        if override:
            project['title'] = override

    if PROJECT_ORDER:
        lookup = {project['dir_name'].lower(): project for project in projects}
        ordered = []
        for dir_name in PROJECT_ORDER:
            item = lookup.pop(dir_name.lower(), None)
            if item:
                ordered.append(item)
        for project in projects:
            if project['dir_name'].lower() in lookup:
                ordered.append(project)
        projects = ordered

    for index, project in enumerate(projects):
        project['accent'] = PALETTE[index % len(PALETTE)]
    for index, item in enumerate(archive):
        item['accent'] = PALETTE[index % len(PALETTE)]
    for index, item in enumerate(photography):
        item['accent'] = PALETTE[index % len(PALETTE)]

    home_html = render_layout('Jorne Scholiers', 'page-home', render_home(projects))
    archive_html = render_layout('Archive - Jorne Scholiers', 'page-archive', render_archive_index(archive))
    about_html = render_layout(
        'About - Jorne Scholiers',
        'page-simple page-about',
        render_about_page(),
    )
    photography_html = render_layout('Photography - Jorne Scholiers', 'page-archive page-photography', render_photography_index(photography))
    contact_html = render_layout('Contact - Jorne Scholiers', 'page-simple', render_simple_page('Contact', '<p>Email: <a href="mailto:hello@jornescholiers.com">hello@jornescholiers.com</a></p>'))

    write_file('index.html', home_html)
    write_file('archive.html', archive_html)
    write_file('about.html', about_html)
    write_file('photography.html', photography_html)
    write_file('contact.html', contact_html)

    for project in projects:
        page = render_layout(f"{project['title']} - Jorne Scholiers", 'page-detail', render_project_page(project, 'projects'))
        write_file(f"project-{project['slug']}.html", page)

    for item in archive:
        page = render_layout(f"{item['title']} - Archive", 'page-detail', render_project_page(item, 'archive'))
        write_file(f"archive-{item['slug']}.html", page)


if __name__ == '__main__':
    build_site()
