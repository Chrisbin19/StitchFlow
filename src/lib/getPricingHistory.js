import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export async function getPricingHistory(dressType, material) {
    try {
        // Get last 15 delivered orders of same garment type
        const q = query(
            collection(db, 'orders'),
            where('product.dressType', '==', dressType),
            where('status', '==', 'DELIVERED'),
            orderBy('createdAt', 'desc'),
            limit(15)
        );

        const snap = await getDocs(q);

        return snap.docs
            .map(doc => {
                const d = doc.data();
                return {
                    dressType: d.product?.dressType,
                    material: d.product?.material,
                    totalPrice: d.financial?.totalPrice,
                    fabricSource: d.product?.fabricSource,
                };
            })
            .filter(o => o.totalPrice > 0); // exclude unpaid/zero orders

    } catch (error) {
        console.error('Error fetching pricing history:', error);
        return [];
    }
}