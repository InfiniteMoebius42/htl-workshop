import http from "k6/http";
import { check, group } from "k6";

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        checks: ["rate > 0.95"]  // 5% of checks are allowed to fail
    },
};

export default function () {

    group('generate new pizza and query', () => {
        const id = checkPostPizza();
        checkGetPizza(id);
    });
}

const params = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token abcdef0123456789',
      },
}

function checkGetPizza(id) {

      let res = http.get(`${BASE_URL}/api/pizza/${id}`, params);
      check(res, { "GET api/pizza/{id} returns 200": (res) => res.status === 200 });

      console.log('response ' + JSON.stringify(res.body));
      
      return res.status >= 200 && res.status < 300; 
}

function checkPostPizza() {
    let restrictions = {
        maxCaloriesPerSlice: 500,
        mustBeVegetarian: false,
        excludedIngredients: ["pepperoni"],
        excludedTools: ["knife"],
        maxNumberOfToppings: 6,
        minNumberOfToppings: 2
      }
      let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token abcdef0123456789',
        },
      });
    
      check(res, { "POST api/pizza returns 200": (res) => res.status === 200 });
      let id;
      if(res.status === 200 && res.body) {
        try {
            const body = res.json();//JSON.parse(res.body);
            id = body.pizza.id;
            console.log(`We got a pizza! ${body.pizza.name} with id ${id} (${body.pizza.ingredients.length} ingredients)`);
        } catch (error) {
            console.log('got error ' + error);
        }
      } else {
          console.log('We got an error:', res.status);
      }

      return id;
 }
