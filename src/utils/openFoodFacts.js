export async function lookupBarcode(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
    const data = await res.json()
    if (data.status !== 1) return null
    const p = data.product
    return {
      name: p.product_name || p.product_name_en || '',
      brand: p.brands || '',
      category: 'food',
      subcategory: p.categories_tags?.[0]?.replace('en:', '') || '',
      photo: p.image_url || p.image_front_url || '',
      barcode,
      nutritionGrade: p.nutrition_grades || '',
      quantity: p.quantity || '',
    }
  } catch {
    return null
  }
}
