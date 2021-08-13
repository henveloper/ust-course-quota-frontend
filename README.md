- frontend for ust quota viewer

- backend is in a private project, refer to apiService for the expected api calls

### GET /

### GET /quotas

req {courseCodes: string[]}

resp { section: string, t: number, quota, enrol, avail, wait: number, }[]
