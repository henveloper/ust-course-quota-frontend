import axios, { AxiosRequestConfig } from 'axios';
import { inject, injectable } from 'inversify';
import { IConfigs } from '../system/configs';

export interface IAPIGetCourses {
    courses: {
        ref: string,
        semester: string,
        title: string,
        code: string,
        isLogging: boolean,
        updatedAt: number,
    }[]
}

export interface IAPIGetQuotas {
    quotas: {
        t: number,
        section: string,
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

    public async getCourses() {
        const response = await this.api<IAPIGetCourses>({ url: '/courses' });
        return response.data;
    }

    public async getQuotas(ref: string) {
        const response = await this.api<IAPIGetQuotas>({ url: '/courseReport', params: { ref } });
        return response.data;
    }
}
