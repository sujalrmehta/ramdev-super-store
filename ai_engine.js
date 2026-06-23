const db = require('./db');

// Basic NLP Engine for Zero Dependency Environment
class RamdevAIEngine {
    constructor() {
        this.intents = [
            {
                keywords: ['hello', 'hi', 'hey', 'namaste'],
                response: () => "Namaste! Welcome to Ramdev Super Store. I am your AI assistant. How can I help you today? You can ask me about our products, materials, or health benefits!"
            },
            {
                keywords: ['health', 'benefit', 'why buy', 'ayurved', 'good for'],
                response: (msg) => this.handleHealthInquiry(msg)
            },
            {
                keywords: ['price', 'cost', 'how much', 'cheap', 'expensive'],
                response: (msg) => this.handlePriceInquiry(msg)
            },
            {
                keywords: ['stock', 'available', 'have any', 'looking for', 'buy'],
                response: (msg) => this.handleSearchInquiry(msg)
            },
            {
                keywords: ['shipping', 'delivery', 'deliver', 'time', 'days'],
                response: () => "We offer FREE Pan-India delivery! Most orders are dispatched within 24 hours and delivered within 3-5 business days depending on your pincode."
            },
            {
                keywords: ['thank', 'thanks', 'bye', 'ok', 'great'],
                response: () => "You're very welcome! Let me know if you need help with anything else. Happy shopping!"
            }
        ];
    }

    async processMessage(userMessage) {
        const msg = userMessage.toLowerCase();
        
        // Find matching intent
        for (const intent of this.intents) {
            if (intent.keywords.some(kw => msg.includes(kw))) {
                return await intent.response(msg);
            }
        }

        // Fallback search
        const searchResult = await this.handleSearchInquiry(msg);
        if (searchResult !== "I couldn't find any products matching that description. Could you be more specific?") {
            return searchResult;
        }

        return "I'm not quite sure how to answer that. You can ask me about our cookware, dinnerware, or the health benefits of using brass and copper!";
    }

    async handleHealthInquiry(msg) {
        if (msg.includes('copper')) {
            return "Copper is excellent for your health! According to Ayurveda, storing water in a copper vessel overnight helps balance all three doshas (Vata, Kapha, Pitta) and naturally purifies the water, boosting immunity and digestion.";
        } else if (msg.includes('brass') || msg.includes('peetal')) {
            return "Brass (Peetal) retains up to 70% of food nutrients during cooking compared to modern non-stick pans. It also helps regulate melanin, which is great for healthy skin and hair!";
        } else if (msg.includes('iron') || msg.includes('cast iron')) {
            return "Cooking in Cast Iron naturally infuses your food with dietary iron. It's a fantastic, chemical-free alternative to Teflon and retains heat beautifully for slow cooking.";
        } else if (msg.includes('clay') || msg.includes('earthen')) {
            return "Clay pots are alkaline in nature, which neutralizes the acidic values of food. They also retain moisture perfectly, keeping your curries tender and flavorful without toxic glazes!";
        }
        return "Different materials offer unique Ayurvedic benefits! For example, Copper boosts immunity, Brass retains food nutrients, and Cast Iron adds natural dietary iron to your meals. Which material are you interested in?";
    }

    async handleSearchInquiry(msg) {
        const products = db.getProducts({});
        const matches = products.filter(p => 
            msg.includes(p.name.toLowerCase()) || 
            msg.includes(p.category.toLowerCase()) || 
            msg.includes(p.material.toLowerCase()) ||
            p.name.toLowerCase().includes(msg)
        );

        if (matches.length > 0) {
            const top = matches.slice(0, 2);
            let reply = `Yes, we have some excellent options! For instance, our *${top[0].name}* is very popular. `;
            if (top.length > 1) {
                reply += `We also have the *${top[1].name}*. `;
            }
            reply += `\nYou can search for "${top[0].material}" or "${top[0].category}" in the main search bar to see them!`;
            return reply;
        }
        return "I couldn't find any specific products matching that description right now. Could you try searching for 'Brass', 'Copper', or 'Cookware'?";
    }

    async handlePriceInquiry(msg) {
        return "Our premium traditional utensils are priced to offer the best value for authentic craftsmanship! Prices range from ₹999 for accessories up to ₹5000+ for large royal dinner sets. You can use the price slider in the store to filter products within your budget.";
    }
}

module.exports = new RamdevAIEngine();
