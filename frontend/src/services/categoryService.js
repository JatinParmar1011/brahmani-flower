const BASE_URL = 'http://localhost:8080/api';

export const fetchCategoryTypes = async () => {
  const res = await fetch(`${BASE_URL}/categories/types`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const fetchCategoriesByTypeId = async (typeId) => {
  const res = await fetch(`${BASE_URL}/categories/type/${typeId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const fetchCategories = async (typeName) => {
  const res = await fetch(`${BASE_URL}/categories/${typeName}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};
