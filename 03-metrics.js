import http from "k6/http";
import { check, fail, group } from "k6";

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';


export const options = {
    vus: 5,
    duration: '15s',
    thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{group:::pizza}': ['p(90)<300', 'p(99)<1000'],
    'group_duration{group:::pizza}': ['p(99)<1000'],
    checks: ["rate > 0.95"]
  },
};



function debug(str) {
    if(options.vus === 1 && options.iterations === 1) {
        console.log(str);
    }
} 


export function setup() {
    if(!checkGetQuotes()) {
        fail('initial check failed in setup');
    }
}

export default function () {    

    group('pizza', () => {
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

function checkGetQuotes() {

    let res = http.get(`${BASE_URL}/api/quotes`, params);
    check(res, { "status is 200": (res) => res.status === 200 });

    debug('response ' +  JSON.stringify(res));
    
    return res.status >= 200 && res.status < 300; 
}


function checkGetPizza(id) {

      let res = http.get(`${BASE_URL}/api/pizza/${id}`, params);
      check(res, { "status is 200": (res) => res.status === 200 });

      debug('response ' + JSON.stringify(res));
      
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
    
      check(res, { "status is 200": (res) => res.status === 200 });
      let id;
      if(res.status === 200 && res.body) {
        try {
            const body = JSON.parse(res.body);
            id = body.pizza.id;            
        } catch (error) {
            debug('got error ' + error);
        }
      }
      debug(`We got a pizza  ${res.json().pizza.name} with id (${res.json().pizza.ingredients.length} ingredients)`);    
 
      //console.log('We got a pizza! ', JSON.stringify(res));

      return id;
 }
