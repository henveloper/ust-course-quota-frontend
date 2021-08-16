# ust quota viewer

![demo](./demo.jpg)

* time series data representation of course quotas

* this is not a wrapper, this frontend expects u to implement ur own backend

## backend APIs

### GET /

```
req {}

resp {}
```

### GET /quotas

```
req { hour: number }

resp {
    quotas: { 
        courseCode: string,
        section: string,
        t: number,
        quota, enrol, avail, wait: number,
    }[]
}
```