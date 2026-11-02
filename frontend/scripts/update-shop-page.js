const fs = require('fs');
let code = fs.readFileSync('frontend/app/shop/page.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Change PAGE_SIZE to 24
code = code.replace('const PAGE_SIZE = 12;', 'const PAGE_SIZE = 24;');

// 2. Add categorySearch state
code = code.replace(
  "const [showFilters, setShowFilters] = useState(false);",
  "const [showFilters, setShowFilters] = useState(false);\n  const [categorySearch, setCategorySearch] = useState('');"
);

// 3. Update category filter sidebar
const targetCatBlock = `          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={cn(
                  'block w-full text-left text-sm px-2 py-1 rounded transition-colors',
                  !selectedCategory ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                )}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={cn(
                    'block w-full text-left text-sm px-2 py-1 rounded transition-colors',
                    selectedCategory === cat.slug ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>`;

const newCatBlock = `          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-navy">Categories ({categories.length})</h3>
              {selectedCategory && (
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              type="text"
              placeholder="Search 51 categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="h-8 text-xs mb-2"
            />
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={cn(
                  'block w-full text-left text-sm px-2 py-1 rounded transition-colors',
                  !selectedCategory ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                )}
              >
                All Categories
              </button>
              {categories
                .filter((cat) => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={cn(
                      'block w-full text-left text-sm px-2 py-1 rounded transition-colors truncate',
                      selectedCategory === cat.slug ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                    )}
                    title={cat.name}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>`;

if (code.includes(targetCatBlock)) {
  code = code.replace(targetCatBlock, newCatBlock);
  fs.writeFileSync('frontend/app/shop/page.tsx', code, 'utf8');
  console.log('Successfully updated shop/page.tsx');
} else {
  console.error('Target category block not found!');
}
