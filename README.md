## What is QuickPizza? 🍕🍕🍕

`QuickPizza` is a web application, used for demonstrations and workshops, that generates new and exciting pizza combinations!

The app is built using [SvelteKit](https://kit.svelte.dev/) for the frontend and [Go](https://go.dev/) for the backend.

The tests written for `QuickPizza` demonstrates the basic and advanced functionalities of k6, ranging from a basic load test to using different modules and extensions. QuickPizza is used in the the [k6-oss-workshop](https://github.com/grafana/k6-oss-workshop).

## Requirements

- [Grafana k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) 


## The examples

### 01-hello-k6

```bash
k6 run -e BASE_URL=https:// 01-hello-k6.js
```

### 02-functional

```bash
k6 run -e BASE_URL=https:// 02-functional-test.js
```

### 03-metrics

```bash
k6 run -e BASE_URL=https:// 03-metrics.js
```

### 04-scenarios

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run -e BASE_URL=https:// 04-scenarios.js```
```

### 05-hybrid

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report-hybrid.html k6 run -e BASE_URL=https:// 05-hybrid.js
```
