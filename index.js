const axios = require('axios');
const cron = require('node-cron');

// --- הנתונים שלך ---
const RAPID_API_KEY = '49f154743cmsheac49e6022b0109p1b19cfjsn19a8d00e2b8f';
const RAPID_API_HOST = 'aliexpress-datahub.p.rapidapi.com';
const ID_INSTANCE = '7107598239';
const API_TOKEN = 'fe0569effb3f4a3198f2835cbdc5a92cd491e6142d5c4aaa98';
const PHONE_NUMBER = '972539582526'; 

// רשימת מוצרים (תוסיף כאן הרבה מזהים כדי שלא יחזור על עצמו)
const productList = ["1005006132805253", "1005006101452145", "1005005874521458"]; 
let currentIndex = 0;

async function sendDeal() {
    const productId = productList[currentIndex];
    currentIndex = (currentIndex + 1) % productList.length;

    try {
        const response = await axios.get(`https://${RAPID_API_HOST}/item_detail`, {
            params: { itemId: productId },
            headers: { 'X-RapidAPI-Key': RAPID_API_KEY, 'X-RapidAPI-Host': RAPID_API_HOST }
        });

        if (response.data && response.data.item) {
            const item = response.data.item;
            const message = `🔥 *שווה קנייה🛒* 🔥\n\n${item.title}\n\n💰 *מחיר:* ${item.price.sale_price.formatted_price}\n\n🔗 *לינק:* https://www.aliexpress.com/item/${productId}.html`;
            
            await axios.post(`https://7107.api.greenapi.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`, {
                chatId: `${PHONE_NUMBER}@c.us`,
                message: message
            });
            console.log(`✅ פורסם מוצר: ${productId}`);
        }
    } catch (e) { console.log("שגיאה או אליאקספרס לא זמין"); }
}

// --- תזמון המשימות ---

// 1. ימי חול (א'-ו'): 3 מוצרים בבוקר (09:00), 3 בצהריים (14:00), 3 בערב (20:00)
// אנחנו נשלח אותם בהפרש של דקה אחד מהשני כדי שלא יחסמו אותנו
cron.schedule('0,1,2 9,14,20 * * 0-5', sendDeal);

// 2. מוצאי שבת: מ-21:00 עד 22:00, כל 20 דקות (21:00, 21:20, 21:40, 22:00)
cron.schedule('0,20,40 21 * * 6', sendDeal);
cron.schedule('0 22 * * 6', sendDeal);

console.log("🚀 הבוט תוחנת בהצלחה! פועל לפי השעות שביקשת.");