class transactionModel {
    constructor(db) {
        this.db = db;
    }

    async addTransaction(clientId, giftId, birthday) {
        const formatted_date = new Date().toISOString().slice(0, 19).replace('T', ' ')
        const query = "INSERT INTO loyalty_card.transactions (client_id, gift_id, is_birthday_gift, transaction_date) VALUES ($1, $2, $3, $4)";
        await this.db.query(query, [clientId, giftId, birthday, formatted_date]);
    }

    async getTransactionsByClientId(clientId) {
        const query = "SELECT * FROM loyalty_card.transactions WHERE client_id = $1";
        const result = await this.db.query(query, [clientId]);
        return result.rows;
    }
}

module.exports = transactionModel;