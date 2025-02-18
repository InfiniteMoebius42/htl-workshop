import http from "k6/http";
import { check, fail, group } from "k6";
import { browser } from "k6/browser";

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';


export const options = {
    scenarios: {
        scenario1: {
            executor: 'constant-vus',
            vus: 1,
            duration: '120s',
            tags: { scenario: 'scenario1' }, // Custom tag for scenario1
        },
        scenario2: {
            executor: 'constant-vus',
            vus: 10,
            duration: '120s',
            startTime: '120s',
            tags: { scenario: 'scenario2' }, // Custom tag for scenario2
        },
        scenario3: {
            executor: 'constant-vus',
            vus: 75,
            duration: '30s',
            startTime: '240s',
            tags: { scenario: 'scenario3' }, // Custom tag for scenario3
        },
        scenario4: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            startTime: '270s',
            tags: { scenario: 'scenario4' }, // Custom tag for scenario4
        },
        ui: {
            exec: 'checkBrowser',
            executor: "per-vu-iterations",
            vus: 1,
            iterations: 15,
            options: {
              browser: {
                type: "chromium",
              },
            },
        },      
    },
    thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{group:::pizza,scenario:scenario1}': ['p(90)<300', 'p(99)<1000'],
    'http_req_duration{group:::pizza,scenario:scenario2}': ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{group:::pizza,scenario:scenario3}': ['p(95)<500'],
    'http_req_duration{group:::pizza,scenario:scenario4}': ['p(95)<500', 'p(99)<1000'],
    'group_duration{group:::pizza,scenario:scenario1}': ['p(99)<1000'],
    'group_duration{group:::pizza,scenario:scenario2}': ['p(95)<1000'],
    'group_duration{group:::pizza,scenario:scenario3}': ['p(95)<1000'],
    'group_duration{group:::pizza,scenario:scenario4}': ['p(95)<1000'],
    checks: ["rate > 0.95"]
  },
};


export async function checkBrowser() {
  let checkData;
  const page = await browser.newPage();
  try {

    await page.goto(BASE_URL);
    checkData = await page.locator("h1").textContent();
    check(page, {
      header: checkData == "Looking to break out of your pizza routine?",
    });

    await page.locator('//button[. = "Pizza, Please!"]').click();
    await page.waitForTimeout(500);
    //await page.screenshot({ path: "screenshot.png" });
    checkData = await page.locator("div#recommendations").textContent();
    check(page, {
      recommendation: checkData != "",
    });
  } finally {
    await page.close();
  }
}


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
