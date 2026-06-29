import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Plus, ArrowRightLeft, Search, Bell, ChevronDown, 
  Landmark, PiggyBank, CreditCard, Filter, Grid, List 
} from 'lucide-react';

// Инициализация Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Все счета');

  // Загрузка данных из Supabase
  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Ошибка загрузки:', error);
    else setAccounts(data || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Функция добавления нового счета
  const handleAddAccount = async () => {
    const name = prompt('Введите название счета:');
    if (!name) return;
    const balance = parseFloat(prompt('Введите начальный баланс:') || '0');
    
    const { error } = await supabase.from('accounts').insert([
      { name, bank_name: 'Новый Банк', type: 'Текущий', balance, currency: '₽' }
    ]);

    if (error) {
      alert('Ошибка при добавлении счета');
      console.error(error);
    } else {
      fetchAccounts(); // Обновляем список после добавления
    }
  };

  // Вычисления для карточек статистики
  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const currentBalance = accounts.filter(a => a.type === 'Текущий').reduce((acc, curr) => acc + Number(curr.balance), 0);
  const savingsBalance = accounts.filter(a => a.type === 'Накопительный').reduce((acc, curr) => acc + Number(curr.balance), 0);
  const creditBalance = accounts.filter(a => a.type === 'Кредитный').reduce((acc, curr) => acc + Number(curr.balance), 0);

  // Фильтрация счетов по вкладкам
  const filteredAccounts = accounts.filter(acc => {
    if (activeTab === 'Все счета') return true;
    if (activeTab === 'Текущие' && acc.type === 'Текущий') return true;
    if (activeTab === 'Накопительные' && acc.type === 'Накопительный') return true;
    if (activeTab === 'Кредитные' && acc.type === 'Кредитный') return true;
    return false;
  });

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* ЛЕВОЕ МЕНЮ (Сайдбар) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-xl font-bold">FinFlow</span>
          </div>
          
          <nav className="mt-4 px-4">
            {/* Единственная кнопка в меню по вашему запросу */}
            <button className="flex items-center space-x-3 w-full px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium">
              <Wallet size={20} />
              <span>Счета</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 m-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl">
          <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Андрей Иванов</p>
            <p className="text-xs text-gray-500">Профиль</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </aside>

      {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Счета</h1>
            <p className="text-sm text-gray-500 mt-1">Все ваши счета и карты в одном месте</p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleAddAccount} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
              <Plus size={18} />
              <span>Добавить счёт</span>
            </button>
            <button className="flex items-center space-x-2 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition">
              <ArrowRightLeft size={18} />
              <span>Перевод между счетами</span>
            </button>
            <div className="flex space-x-3 text-gray-400 pl-4 border-l border-gray-200">
              <Search size={20} className="cursor-pointer hover:text-gray-600" />
              <div className="relative">
                <Bell size={20} className="cursor-pointer hover:text-gray-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* КАРТОЧКИ СВОДКИ */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Всего на счетах</p>
              <h2 className="text-2xl font-bold">{totalBalance.toLocaleString()} ₽</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Текущие счета</p>
              <h2 className="text-2xl font-bold">{currentBalance.toLocaleString()} ₽</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Накопительные счета</p>
              <h2 className="text-2xl font-bold">{savingsBalance.toLocaleString()} ₽</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Кредитные счета</p>
              <h2 className="text-2xl font-bold">{creditBalance.toLocaleString()} ₽</h2>
            </div>
          </div>

          {/* ВКЛАДКИ И ФИЛЬТРЫ */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-6 border-b border-gray-200 w-full">
              {['Все счета', 'Текущие', 'Накопительные', 'Кредитные'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-medium transition-colors ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* СПИСОК СЧЕТОВ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Загрузка данных...</div>
            ) : filteredAccounts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Нет счетов в этой категории.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAccounts.map((acc) => (
                  <div key={acc.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center space-x-4 w-1/3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white
                        ${acc.type === 'Текущий' ? 'bg-emerald-500' : acc.type === 'Накопительный' ? 'bg-blue-500' : 'bg-red-400'}`}>
                        {acc.type === 'Текущий' ? <Landmark size={24} /> : acc.type === 'Накопительный' ? <PiggyBank size={24} /> : <CreditCard size={24} />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{acc.name}</h3>
                        <p className="text-xs text-gray-500">{acc.currency} • {acc.bank_name}</p>
                      </div>
                    </div>
                    <div className="w-1/3 text-left">
                      <p className="text-xs text-gray-500 mb-1">Доступно</p>
                      <p className="font-semibold">{Number(acc.balance).toLocaleString()} {acc.currency}</p>
                    </div>
                    <div className="w-1/3 text-right pr-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        •••
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <button onClick={handleAddAccount} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center justify-center space-x-2 w-full">
                <Plus size={18} />
                <span>Добавить счёт или карту</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ПРАВАЯ ПАНЕЛЬ (Виджеты) */}
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-6">
        
        {/* Распределение средств (Заглушка для графика) */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Распределение средств</h3>
          <div className="flex items-center justify-between">
            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 border-t-blue-500 border-l-red-500"></div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between space-x-4">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Текущие</span>
                <span className="font-medium">55%</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>Копилки</span>
                <span className="font-medium">39%</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Кредит</span>
                <span className="font-medium">6%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Последние операции */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Последние операции</h3>
            <button className="text-sm text-indigo-600 hover:underline">Смотреть все</button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Перевод на карту</p>
                  <p className="text-xs text-gray-500">Сегодня, 11:20</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">-150,00 ₽</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Зарплата</p>
                  <p className="text-xs text-gray-500">Сегодня, 09:00</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-500">+2 500,00 ₽</span>
            </div>
          </div>
        </div>

        {/* Рекламный баннер / Копите проще */}
        <div className="mt-8 bg-indigo-50 rounded-2xl p-5 relative overflow-hidden">
          <h4 className="font-semibold text-indigo-900 mb-2 relative z-10">Копите проще</h4>
          <p className="text-xs text-indigo-700 mb-4 relative z-10">Создайте цель и перенаправляйте часть дохода на неё автоматически</p>
          <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg relative z-10 hover:bg-indigo-700">Создать цель</button>
          {/* Декоративный элемент вместо 3D свинки */}
          <PiggyBank size={64} className="absolute -bottom-4 -right-4 text-indigo-200 opacity-50 transform rotate-[-15deg]" />
        </div>

      </aside>

    </div>
  );
}
