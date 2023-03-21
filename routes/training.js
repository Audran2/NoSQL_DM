const training = (db, app) => {
  const companiesCollection = db.collection("companies");
  const postsCollection = db.collection("posts");

  app.get("/training/getCompaniesEmployees", async (req, res) => {
    const result = await companiesCollection
      .find({ number_of_employees: { $gt: 2750 }, founded_year: { $lt: 2012 } })
      .project({
        name: 1,
        email_address: 1,
        number_of_employees: 1,
        founded_year: 1,
      })
      .sort({ number_of_employees: -1 })
      .toArray();
    res.json(result);
  });

  app.get("/training/getPostsByAuthor/:author", async (req, res) => {
    const author = req.params.author;
    const result = await postsCollection
      .findOne({
        "comments.author": author,
      }, {projection: { body: 0, permalink: 0 }});
    res.json(result);
  });
};
module.exports = { training };
