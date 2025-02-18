import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export default function () {
    let res = http.get(`${BASE_URL}`,);
    check(res, { 'is status  200': (res) => res.status === 200 });
}

