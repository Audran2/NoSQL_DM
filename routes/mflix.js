const mflix = (db, app) => {
  var ObjectId = require("mongodb").ObjectId;
  const moviesCollection = db.collection("movies");
  const commentsCollection = db.collection("comments");
  const usersCollection = db.collection("users");

  app.get("/mflix/getMovies", async (req, res) => {
    const result = await moviesCollection
      .aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "movie_id",
            as: "comments",
          },
        },
        {
          $sort: { released: -1 },
        },
        {
          $project: {
            "comments.movie_id": 0,
          },
        },
      ])
      .limit(10)
      .toArray();
    res.json(result);
  });

  app.post("/mflix/addMovie", (req, res) => {
    const movie = req.body;
    console.log(movie);
    const result = moviesCollection.insertOne(movie);

    res.send(result);
  });

  app.get("/mflix/getMovieByName/:title", async (req, res) => {
    const title = req.params.title;
    const result = await moviesCollection.findOne({
      title: { $regex: title, $options: "i" },
    });
    res.json(result);
  });

  app.delete("/mflix/deleteMovie/:title", async (req, res) => {
    const title = req.params.title;
    const result = await moviesCollection.deleteOne({
      title: { $regex: title, $options: "i" },
    });
    res.json(result);
  });

  app.put("/mflix/updateMovie", (req, res) => {
    const result = moviesCollection.updateOne(
      { title: req.body.title },
      { $set: req.body.newValue }
    );
    res.send(result);
  });

  app.get("/mflix/getRankedMovies", async (req, res) => {
    const result = await moviesCollection
      .aggregate([
        {
          $project: {
            _id: 1,
            title: 1,
            released: 1,
            imdb: 1,
            tomatoes: 1,
            ranking: {
              $divide: [
                {
                  $round: [
                    { $sum: ["$imdb.rating", "$tomatoes.viewer.rating"] },
                    0,
                  ],
                },
                {
                  $dateDiff: {
                    startDate: "$released",
                    endDate: "$$NOW",
                    unit: "year",
                  },
                },
              ],
            },
          },
        },
        { $sort: { ranking: -1 } },
        { $limit: 10 },
      ])
      .toArray();
    res.json(result);
  });

  app.get("/mflix/getRankedMoviesByCommentsNumber", async (req, res) => {
    const result = await moviesCollection
      .aggregate([
        {
          $sort: {
            num_mflix_comments: -1,
          },
        },
        {
          $project: {
            num_mflix_comments: 0,
          },
        },
        {
          $limit: 10,
        },
      ])
      .toArray();
    res.json(result);
  });

  app.get("/mflix/getComments", async (req, res) => {
    const result = await commentsCollection
      .aggregate([
        {
          $lookup: {
            from: "movies",
            localField: "movie_id",
            foreignField: "_id",
            as: "movie",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "email",
            foreignField: "email",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $unwind: {
            path: "$movie",
          },
        },
        {
          $sort: { date: -1 },
        },
        {
          $project: {
            name: 0,
            email: 0,
            movie_id: 0,
          },
        },
      ])
      .limit(10)
      .toArray();
    res.json(result);
  });

  app.get("/mflix/getComment/:text", async (req, res) => {
    const text = req.params.text;
    const result = await commentsCollection.findOne({
      text: { $regex: text, $options: "i" },
    });
    res.json(result);
  });

  app.post("/mflix/addComment", (req, res) => {
    const comment = req.body;
    console.log(comment);
    const result = commentsCollection.insertOne({
      ...req.body,
      date: new Date(),
    });
    res.send(result);
  });

  app.put("/mflix/updateComment", (req, res) => {
    const result = commentsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body.newValue, date: new Date() } }
    );
    res.send(result);
  });

  app.delete("/mflix/deleteComment/:id", (req, res) => {
    const result = commentsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(result);
  });

  app.get("/mflix/getUsers", async (req, res) => {
    const result = await usersCollection
      .aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "email",
            foreignField: "email",
            as: "comments",
          },
        },
        {
          $sort: { date: -1 },
        },
        {
          $project: {
            "comments.email": 0,
            "comments.name": 0,
          },
        },
      ])
      .limit(20)
      .toArray();
    res.json(result);
  });

  app.delete("/mflix/deleteUser/:email", async (req, res) => {
    const result = await usersCollection.deleteOne({
      email: req.params.email,
    });
    res.json(result);
  });

  app.put("/mflix/updateUser", (req, res) => {
    const result = usersCollection.updateOne(
      { name: req.body.name, email: req.body.email },
      { $set: req.body.newValue }
    );
    res.send(result);
  });

  app.get("/mflix/getUserByEmail/:email", async (req, res) => {
    const result = await usersCollection.findOne({ email: req.params.email });
    res.json(result);
  });
};
module.exports = { mflix };
