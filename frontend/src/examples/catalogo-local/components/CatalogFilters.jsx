function CatalogFilters({
  search,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
  sortOrder,
  onSortOrderChange,
}) {
  return (
    <>
      <label className="catalog-search">
        <span>Buscar conservas</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Ej. pimientos"
        />
      </label>
      <label className="catalog-category">
        <span>Categoría</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="all">Todas</option>
          {categories.map((catalogCategory) => (
            <option key={catalogCategory.slug} value={catalogCategory.slug}>{catalogCategory.name}</option>
          ))}
        </select>
      </label>
      <label className="catalog-sort">
        <span>Ordenar</span>
        <select value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value)}>
          <option value="featured">Recomendados</option>
          <option value="price-ascending">Menor precio</option>
          <option value="price-descending">Mayor precio</option>
        </select>
      </label>
    </>
  )
}

export default CatalogFilters
