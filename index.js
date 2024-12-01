const express = require('express');
const path = require('path');
let cors = require('cors');
let sqlite3 = require('sqlite3').verbose();

let { open } = require('sqlite');

const app = express();
const port = 3010;

app.use(cors());
app.use(express.json());

app.use(express.static('static'));

let db;

(async () => {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database,
  });
})();

async function fetchAllRestaurants() {
  let query = 'SELECT * FROM restaurants';
  let response = await db.all(query, []);
  return { restaurants: response };
}

//Exercise 1: Get All Restaurants
app.get('/restaurants', async (req, res) => {
  try {
    let results = await fetchAllRestaurants();

    if (results.restaurants.length === 0) {
      return res.send(404).json({ message: 'No Restaurants Found. ' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsById(id) {
  let query = 'SELECT * FROM restaurants WHERE id = ?';
  let response = await db.all(query, [id]);
  return { restaurants: response };
}

//Exercise 2: Get Restaurant by ID
app.get('/restaurants/details/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let results = await fetchRestaurantsById(id);

    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsByCuisine(cuisine) {
  let query = 'SELECT * FROM restaurants WHERE cuisine = ?';
  let response = await db.all(query, [cuisine]);
  return { restaurants: response };
}

//Exercise 3: Get Restaurants by Cuisine
app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  try {
    let cuisine = req.params.cuisine;
    let results = await fetchRestaurantsByCuisine(cuisine);

    if (results.restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: 'No Restaurants with this cuisine found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsByFilter(filters) {
  let query = 'SELECT * FROM restaurants WHERE 1=1';
  let params = [];

  if (filters.isVeg) {
    query += ' AND isVeg = ?';
    params.push(filters.isVeg);
  }
  if (filters.hasOutdoorSeating) {
    query += ' AND hasOutdoorSeating = ?';
    params.push(filters.hasOutdoorSeating);
  }
  if (filters.isLuxury) {
    query += ' AND isLuxury = ?';
    params.push(filters.isLuxury);
  }

  let response = await db.all(query, params);
  return { restaurants: response };
}

// Exercise 4: Get Restaurants by Filter
app.get('/restaurants/filter', async (req, res) => {
  try {
    let filters = {
      isVeg: req.query.isVeg,
      hasOutdoorSeating: req.query.hasOutdoorSeating,
      isLuxury: req.query.isLuxury,
    };

    let results = await fetchRestaurantsByFilter(filters);

    if (results.restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: 'No Restaurants found with the specified filters.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsSortedByRating() {
  let query = 'SELECT * FROM restaurants ORDER BY rating DESC';
  let response = await db.all(query);
  return { restaurants: response };
}

// Exercise 5: Get Restaurants Sorted by Rating
app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let results = await fetchRestaurantsSortedByRating();

    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchAllDishes() {
  let query = 'SELECT * FROM dishes';
  let response = await db.all(query);
  return { dishes: response };
}

// Exercise 6: Get All Dishes
app.get('/dishes', async (req, res) => {
  try {
    let results = await fetchAllDishes();

    if (results.dishes.length === 0) {
      return res.status(404).json({ message: 'No Dishes found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchDishById(id) {
  let query = 'SELECT * FROM dishes WHERE id = ?';
  let response = await db.get(query, [id]);
  return { dish: response };
}

// Exercise 7: Get Dish by ID
app.get('/dishes/details/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let results = await fetchDishById(id);

    if (!results.dish) {
      return res.status(404).json({ message: 'Dish not found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchDishesByFilter(filters) {
  let query = 'SELECT * FROM dishes WHERE 1=1';
  let params = [];

  if (filters.isVeg) {
    query += ' AND isVeg = ?';
    params.push(filters.isVeg);
  }

  let response = await db.all(query, params);
  return { dishes: response };
}

// Exercise 8: Get Dishes by Filter
app.get('/dishes/filter', async (req, res) => {
  try {
    let filters = {
      isVeg: req.query.isVeg,
    };

    let results = await fetchDishesByFilter(filters);

    if (results.dishes.length === 0) {
      return res
        .status(404)
        .json({ message: 'No Dishes found with the specified filters.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchDishesSortedByPrice() {
  let query = 'SELECT * FROM dishes ORDER BY price ASC';
  let response = await db.all(query);
  return { dishes: response };
}

// Exercise 9: Get Dishes Sorted by Price
app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    let results = await fetchDishesSortedByPrice();

    if (results.dishes.length === 0) {
      return res.status(404).json({ message: 'No Dishes found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
