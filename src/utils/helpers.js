export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('pt-BR');

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const isToday = (dateStr) => {
  const d = new Date(dateStr);
  const t = new Date();
  return d.toDateString() === t.toDateString();
};

export const isThisWeek = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return d >= weekStart;
};

export const isThisMonth = (dateStr) => {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};

export const CATEGORIES = [
  { value: 'cerveja', label: 'Cervejas' },
  { value: 'destilado', label: 'Destilados' },
  { value: 'vinho', label: 'Vinhos' },
  { value: 'refrigerante', label: 'Refrigerantes' },
  { value: 'energetico', label: 'Energéticos' },
  { value: 'agua', label: 'Águas' },
  { value: 'suco', label: 'Sucos' },
  { value: 'outro', label: 'Outros' },
];

export const UNITS = [
  { value: 'unidade', label: 'Unidade' },
  { value: 'garrafa', label: 'Garrafa' },
  { value: 'lata', label: 'Lata' },
  { value: 'caixa', label: 'Caixa' },
  { value: 'fardo', label: 'Fardo' },
];

export const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'debito', label: 'Cartão de Débito' },
  { value: 'fiado', label: 'Fiado' },
];

export const getCategoryLabel = (value) =>
  CATEGORIES.find(c => c.value === value)?.label || value;

export const getPaymentLabel = (value) => {
  const map = { dinheiro: 'Dinheiro', pix: 'Pix', credito: 'Cartão de Crédito', debito: 'Cartão de Débito', fiado: 'Fiado' };
  return map[value] || value;
};

export const isPendente = (sale) => sale.status === 'pendente';

export const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Skol 350ml Lata', category: 'cerveja', brand: 'Skol', costPrice: 2.50, sellPrice: 4.00, quantity: 120, minStock: 24, unit: 'lata' },
  { id: 'p2', name: 'Brahma 600ml', category: 'cerveja', brand: 'Brahma', costPrice: 5.00, sellPrice: 8.00, quantity: 60, minStock: 12, unit: 'garrafa' },
  { id: 'p3', name: 'Heineken 330ml Lata', category: 'cerveja', brand: 'Heineken', costPrice: 5.50, sellPrice: 9.00, quantity: 48, minStock: 12, unit: 'lata' },
  { id: 'p4', name: 'Coca-Cola 2L', category: 'refrigerante', brand: 'Coca-Cola', costPrice: 6.50, sellPrice: 10.00, quantity: 30, minStock: 10, unit: 'garrafa' },
  { id: 'p5', name: 'Coca-Cola Lata 350ml', category: 'refrigerante', brand: 'Coca-Cola', costPrice: 2.80, sellPrice: 5.00, quantity: 72, minStock: 24, unit: 'lata' },
  { id: 'p6', name: 'Vodka Smirnoff 998ml', category: 'destilado', brand: 'Smirnoff', costPrice: 35.00, sellPrice: 55.00, quantity: 15, minStock: 5, unit: 'garrafa' },
  { id: 'p7', name: 'Whisky J.B. 1L', category: 'destilado', brand: 'J.B.', costPrice: 65.00, sellPrice: 99.00, quantity: 8, minStock: 3, unit: 'garrafa' },
  { id: 'p8', name: 'Red Bull 250ml', category: 'energetico', brand: 'Red Bull', costPrice: 7.00, sellPrice: 12.00, quantity: 5, minStock: 12, unit: 'lata' },
  { id: 'p9', name: 'Monster Energy 473ml', category: 'energetico', brand: 'Monster', costPrice: 7.50, sellPrice: 13.00, quantity: 24, minStock: 12, unit: 'lata' },
  { id: 'p10', name: 'Água Crystal 500ml', category: 'agua', brand: 'Crystal', costPrice: 0.80, sellPrice: 2.00, quantity: 48, minStock: 24, unit: 'garrafa' },
  { id: 'p11', name: 'Suco Del Valle Uva 290ml', category: 'suco', brand: 'Del Valle', costPrice: 2.20, sellPrice: 4.00, quantity: 36, minStock: 12, unit: 'unidade' },
  { id: 'p12', name: 'Vinho Suave Tinto 750ml', category: 'vinho', brand: 'Pérgola', costPrice: 18.00, sellPrice: 28.00, quantity: 20, minStock: 6, unit: 'garrafa' },
];
