const analytics = (db, app) => {
    const accountNumberCustomerCollection = db.collection("accountNumberCustomer");
    const transactionsCollection = db.collection("transactions");
    const transactionsPerDayCollection = db.collection("transactionsPerDay");
    const transactionsPerCustomersCollection = db.collection("transactionsPerCustomers");

    app.post("/analytics/createAccountNumber", async (req, res) => {
        const result = await customersCollection
          .aggregate([
            {
              $addFields: {
                numberAccounts: {
                  $size: "$accounts",
                },
              },
            },
            {
              $group: {
                _id: "$_id",
                nbOfAccounts: {
                  $sum: "$numberAccounts",
                },
              },
            },
            {
              $out: { db: "sample_analytics", coll: "accountNumberCustomer" },
            },
          ])
          .toArray();
        res.json(result);
      });
  
      app.get("/analytics/getAccountNumberCustomer", async (req, res) => {
        const result = await accountNumberCustomerCollection.find({}).toArray();
        res.json(result);
      });
  
      app.post(
        "/analytics/createTransactionsByDay",
        async (req, res) => {
          const result = await transactionsCollection
            .aggregate([
              {
                $unwind: {
                  path: "$transactions",
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      date: "$transactions.date",
                      format: "%Y/%m/%d",
                    },
                  },
                  transactions: {
                    $push: "$transactions",
                  },
                },
              },
              {
                $out: { db: "sample_analytics", coll: "transactionsPerDay" },
              },
            ])
            .toArray();
          res.json(result);
        }
      );
  
      app.get("/analytics/getTransactionsPerDay", async (req, res) => {
        const result = await transactionsPerDayCollection.find({}).toArray();
        res.json(result);
      });
  
      app.post(
        "/analytics/createRankedTransaction",
        async (req, res) => {
          const result = await customersCollection
            .aggregate([
              {
                $lookup: {
                  from: "transactions",
                  localField: "accounts",
                  foreignField: "account_id",
                  as: "transactions",
                },
              },
              {
                $addFields: {
                  numberOfTransactions: {
                    $sum: "$transactions.transaction_count",
                  },
                },
              },
              {
                $project: {
                  name: 1,
                  email: 1,
                  accounts: 1,
                  numberOfTransactions: 1,
                },
              },
              {
                $sort: { numberOfTransactions: -1 },
              },
              {
                $out: {
                  db: "sample_analytics",
                  coll: "transactionsPerCustomers",
                },
              },
            ])
            .toArray();
          res.json(result);
        }
      );
  
      app.get("/analytics/getTransactionsPerCustomers", async (req, res) => {
        const result = await transactionsPerCustomersCollection
          .find({})
          .toArray();
        res.json(result);
      });

};
module.exports = { analytics };