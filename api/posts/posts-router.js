const express = require('express');
const router = express.Router();

const DB = require('../../data/db');

// 1: Pull Stuff from Req
// 2: Interact w/ DB
// 3: Response

router.get('/', async (req, res) => {
  try {
    const allPosts = await DB.find();
    res.status(200).json(allPosts);
  } catch(error) {
    console.log(error.message);
    res.status(500).json({ error: "The posts information could not be retrieved." });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const specificPost = await DB.findById(id);
    specificPost 
      ? res.status(200).json(specificPost) 
      : res.status(404).json({ message: "The post with the specified ID does not exist." });
  } catch(error) {
    console.log(error.message);
    res.status(500).json({ error: "The post information could not be retrieved." });
  }
});

router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const postComments = await DB.findPostComments(id);
    postComments 
      ? res.status(200).json(postComments)
      : res.status(404).json({ message: "The post with the specified ID does not exist." });
  } catch(error) {
    console.log(error.message);
    res.status(500).json({ error: "The comments information could not be retrieved." });
  }
});

router.post('/', (req, res) => {
  if(!req.body.title || !req.body.contents) {
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
  } else {
    DB.insert(req.body)
      .then(newPost => {
        res.status(201).json(newPost);
      })
      .catch(error => {
        console.log(error.message);
        res.status(500).json({ error: "There was an error while saving the post to the database" });
      })
  }
});

router.post('/:id/comments', (req, res) => {
  const { id } = req.params;
  const newComment = req.body;
  DB.findById(id)
    .then(() => {
      if(!newComment.text) {
        res.status(400).json({ errorMessage: "Please provide text for the comment." });
      } else {
        DB.insertComment(newComment)
          .then(newCom => {
            res.status(201).json(newCom);
          })
          .catch(error => {
            console.log(error.message);
            res.status(500).json({ error: "There was an error while saving the comment to the database" });
          })
      }
    })
    .catch(error => {
      console.log(error.message);
      res.status(404).json({ message: "The post with the specified ID does not exist." })
    })
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  DB.findById(id)
    .then(() => {
      DB.remove(id)
        .then(deleted => {
          res.status(200).json(deleted)
        })
        .catch(error => {
          console.log(error);
          res.status(500).json({ error: "The post could not be removed" });
        })
    })
    .catch(error => {
      console.log(error.message);
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    })
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const newPost = req.body;
  DB.findById(id)
    .then(() => {
      if(!newPost.title || !newPost.contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
      } else {
        DB.update(id, newPost)
          .then(post => {
            res.status(200).json(post)
          })
          .catch(error => {
            console.log(error.message);
            res.status(500).json({ error: "The post information could not be modified." });
          })
      }
    })
    .catch(error => {
      console.log(error.message);
      res.status(404).json({ message: "The post with the specified ID does not exist." })
    })
});

module.exports = router