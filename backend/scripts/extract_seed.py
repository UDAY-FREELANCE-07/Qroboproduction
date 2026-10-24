import os
import re
import json

migrations_dir = os.path.join(os.path.dirname(__file__), '..', 'postgres', 'seeds')

categories = []
brands = []
products = []
banners = []
promo_cards = []
deals = []
coupons = []
projects = []
tutorials = []

def parse_sql_values(text):
    # Split tuples at top-level parentheses
    tuples = []
    current = []
    in_str = False
    str_char = ''
    depth = 0
    escape = False

    i = 0
    while i < len(text):
        c = text[i]
        if escape:
            current.append(c)
            escape = False
            i += 1
            continue

        if in_str:
            if c == "'":
                if i + 1 < len(text) and text[i+1] == "'":
                    current.append("''")
                    i += 2
                    continue
                else:
                    in_str = False
                    current.append(c)
            else:
                current.append(c)
        else:
            if c == "'":
                in_str = True
                current.append(c)
            elif c == '(':
                if depth == 0:
                    current = []
                else:
                    current.append(c)
                depth += 1
            elif c == ')':
                depth -= 1
                if depth == 0:
                    tuples.append("".join(current))
                    current = []
                else:
                    current.append(c)
            else:
                if depth > 0:
                    current.append(c)
        i += 1
    return tuples

def parse_tuple_fields(tup_str):
    fields = []
    current = []
    in_str = False
    depth = 0
    i = 0
    while i < len(tup_str):
        c = tup_str[i]
        if in_str:
            if c == "'":
                if i + 1 < len(tup_str) and tup_str[i+1] == "'":
                    current.append("'")
                    i += 2
                    continue
                else:
                    in_str = False
            else:
                current.append(c)
        else:
            if c == "'":
                in_str = True
            elif c in ['[', '(']:
                depth += 1
                current.append(c)
            elif c in [']', ')']:
                depth -= 1
                current.append(c)
            elif c == ',' and depth == 0:
                fields.append("".join(current).strip())
                current = []
                i += 1
                continue
            else:
                current.append(c)
        i += 1
    if current:
        fields.append("".join(current).strip())
    return fields

def clean_val(v):
    v = v.strip()
    if v.startswith("ARRAY[") and v.endswith("]"):
        inner = v[6:-1]
        items = parse_tuple_fields(inner)
        return [clean_val(x) for x in items]
    if v.endswith("::jsonb"):
        v = v[:-7].strip()
        if v.startswith("'") and v.endswith("'"):
            v = v[1:-1].replace("''", "'")
        try:
            return json.loads(v)
        except:
            return v
    if v.lower() == 'true':
        return True
    if v.lower() == 'false':
        return False
    if v.lower() == 'null':
        return None
    if re.match(r'^-?\d+(\.\d+)?$', v):
        return float(v) if '.' in v else int(v)
    m = re.search(r"SELECT id FROM categories WHERE slug=['\"]?([a-zA-Z0-9_-]+)['\"]?", v, re.IGNORECASE)
    if m:
        return f"cat-{m.group(1)}"
    m = re.search(r"SELECT id FROM brands WHERE slug=['\"]?([a-zA-Z0-9_-]+)['\"]?", v, re.IGNORECASE)
    if m:
        return f"brand-{m.group(1)}"
    m = re.search(r"SELECT id FROM products WHERE slug=['\"]?([a-zA-Z0-9_-]+)['\"]?", v, re.IGNORECASE)
    if m:
        return f"prod-{m.group(1)}"
    if v == "now()":
        return "2026-10-23T10:00:00Z"
    if "now() +" in v:
        return "2026-11-23T10:00:00Z"
    return v

# 1. Categories & Brands
with open(os.path.join(migrations_dir, '20260918060257_seed_categories_brands.sql'), encoding='utf-8') as f:
    sql = f.read()

cat_match = re.search(r'INSERT INTO categories\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if cat_match:
    cols = [c.strip() for c in cat_match.group(1).split(',')]
    tuples = parse_sql_values(cat_match.group(2))
    for t in tuples:
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"cat-{d['slug']}"
        categories.append(d)

brand_match = re.search(r'INSERT INTO brands\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if brand_match:
    cols = [c.strip() for c in brand_match.group(1).split(',')]
    tuples = parse_sql_values(brand_match.group(2))
    for t in tuples:
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"brand-{d['slug']}"
        brands.append(d)

# 2. Products 1, 2, 3
for prod_file in ['20260918060338_seed_products_1.sql', '20260918060429_seed_products_2.sql', '20260918060540_seed_products_3.sql']:
    with open(os.path.join(migrations_dir, prod_file), encoding='utf-8') as f:
        sql = f.read()
    p_match = re.search(r'INSERT INTO products\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
    if p_match:
        cols = [c.strip() for c in p_match.group(1).split(',')]
        tuples = parse_sql_values(p_match.group(2))
        for t in tuples:
            vals = [clean_val(x) for x in parse_tuple_fields(t)]
            d = dict(zip(cols, vals))
            d['id'] = f"prod-{d['slug']}"
            d['is_published'] = True
            products.append(d)

# 3. Banners, Promo Cards, Deals, Coupons
with open(os.path.join(migrations_dir, '20260918061020_seed_banners_deals_coupons.sql'), encoding='utf-8') as f:
    sql = f.read()

b_match = re.search(r'INSERT INTO banners\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if b_match:
    cols = [c.strip() for c in b_match.group(1).split(',')]
    tuples = parse_sql_values(b_match.group(2))
    for idx, t in enumerate(tuples):
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"banner-{idx+1}"
        banners.append(d)

promo_match = re.search(r'INSERT INTO promo_cards\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if promo_match:
    cols = [c.strip() for c in promo_match.group(1).split(',')]
    tuples = parse_sql_values(promo_match.group(2))
    for idx, t in enumerate(tuples):
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"promo-{idx+1}"
        promo_cards.append(d)

deals_match = re.search(r'INSERT INTO deals\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if deals_match:
    cols = [c.strip() for c in deals_match.group(1).split(',')]
    tuples = parse_sql_values(deals_match.group(2))
    for idx, t in enumerate(tuples):
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"deal-{idx+1}"
        deals.append(d)

coupons_match = re.search(r'INSERT INTO coupons\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if coupons_match:
    cols = [c.strip() for c in coupons_match.group(1).split(',')]
    tuples = parse_sql_values(coupons_match.group(2))
    for idx, t in enumerate(tuples):
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"coupon-{idx+1}"
        coupons.append(d)

# 4. Projects & Tutorials
with open(os.path.join(migrations_dir, '20260918061100_seed_projects_tutorials.sql'), encoding='utf-8') as f:
    sql = f.read()

proj_match = re.search(r'INSERT INTO projects\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if proj_match:
    cols = [c.strip() for c in proj_match.group(1).split(',')]
    tuples = parse_sql_values(proj_match.group(2))
    for idx, t in enumerate(tuples):
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"proj-{d['slug']}"
        projects.append(d)

tut_match = re.search(r'INSERT INTO tutorials\s*\((.*?)\)\s*VALUES\s*(.*?)\s*ON CONFLICT', sql, re.DOTALL | re.IGNORECASE)
if tut_match:
    cols = [c.strip() for c in tut_match.group(1).split(',')]
    tuples = parse_sql_values(tut_match.group(2))
    for idx, t in enumerate(tuples):
        vals = [clean_val(x) for x in parse_tuple_fields(t)]
        d = dict(zip(cols, vals))
        d['id'] = f"tut-{d['slug']}"
        tutorials.append(d)

print(f"Extracted: {len(categories)} categories, {len(brands)} brands, {len(products)} products, {len(banners)} banners, {len(promo_cards)} promo cards, {len(deals)} deals, {len(projects)} projects, {len(tutorials)} tutorials")

# WARNING: running this script OVERWRITES frontend/lib/mock-data.ts (the data the live UI renders).
output_ts = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'lib', 'mock-data.ts')
with open(output_ts, 'w', encoding='utf-8') as f:
    f.write("// Demo catalog data (generated from backend/postgres/seeds/*.sql by backend/scripts/extract_seed.py)\n\n")
    f.write(f"export const mockCategories: any[] = {json.dumps(categories, indent=2)};\n\n")
    f.write(f"export const mockBrands: any[] = {json.dumps(brands, indent=2)};\n\n")
    f.write(f"export const mockProducts: any[] = {json.dumps(products, indent=2)};\n\n")
    f.write(f"export const mockBanners: any[] = {json.dumps(banners, indent=2)};\n\n")
    f.write(f"export const mockPromoCards: any[] = {json.dumps(promo_cards, indent=2)};\n\n")
    f.write(f"export const mockDeals: any[] = {json.dumps(deals, indent=2)};\n\n")
    f.write(f"export const mockCoupons: any[] = {json.dumps(coupons, indent=2)};\n\n")
    f.write(f"export const mockProjects: any[] = {json.dumps(projects, indent=2)};\n\n")
    f.write(f"export const mockTutorials: any[] = {json.dumps(tutorials, indent=2)};\n\n")
    f.write("""export const mockDataMap: Record<string, any[]> = {
  categories: mockCategories,
  brands: mockBrands,
  products: mockProducts,
  banners: mockBanners,
  promo_cards: mockPromoCards,
  deals: mockDeals,
  coupons: mockCoupons,
  projects: mockProjects,
  tutorials: mockTutorials,
};
""")
print(f"Written mock-data.ts successfully!")
