import axios, { AxiosRequestConfig } from 'axios';
import { inject, injectable } from 'inversify';
import { IConfigs } from '../system/configs';

export interface IApiRegisteredCourses {
    courseData: {
        _id: string,
        courseTitle: string,
        isQuotaLogged: boolean,
        updatedAt: number,
        recordCount: number
    }[]
}

export interface IApiCourseReport {
    aggregatedData: {
        _id: number,
        quota: number,
        enrol: number,
        avail: number,
        wait: number,
    }[],
}


@injectable()
export class ApiService {
    @inject('configs')
    public configs!: IConfigs;

    private async api<T>(config: AxiosRequestConfig) {
        return await axios.request<T>({ ...config, baseURL: this.configs.apiServerEndpoint });
    }

    public async root() {
        const response = await this.api<{ isSuccess: true }>({ url: '/' });
        return response.data;
    }

    public async registeredCourses() {
        const response = await this.api<IApiRegisteredCourses>({ url: '/registeredCourses' });
        return response.data;
    }

    public async courseReport(courseCode: string) {
        const response = await this.api<IApiCourseReport>({ url: '/courseReport', params: { code: courseCode } });
        return response.data;
    }
}
