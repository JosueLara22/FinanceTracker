
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { CreditCard } from '../types';

export function useCreditCards() {
  const creditCards = useLiveQuery(() => db.creditCards.toArray(), []);

  const addCreditCard = async (creditCard: Omit<CreditCard, 'id'>) => {
    const newId = crypto.randomUUID();
    const newCreditCard: CreditCard = { ...creditCard, id: newId };
    await db.creditCards.add(newCreditCard);
    return newId;
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    await db.creditCards.update(id, updates);
  };

  const deleteCreditCard = async (id: string) => {
    await db.creditCards.delete(id);
  };

  const getCreditCardById = (id: string) => {
    return db.creditCards.get(id);
  };

  return { 
    creditCards: creditCards || [], 
    addCreditCard, 
    updateCreditCard, 
    deleteCreditCard, 
    getCreditCardById 
  };
}
