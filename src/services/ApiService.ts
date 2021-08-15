import store from 'store';
import axios, { AxiosRequestConfig } from 'axios';
import { inject, injectable } from 'inversify';
import { IConfigs } from '../system/configs';

export interface SectionQuota {
        courseCode: string,
        section: string,
        t: number,
        quota: number,
        enrol: number,
        avail: number,
        wait: number,
}

interface IAPIGetQuotas {
    quotas: SectionQuota[],
}


@injectable()
export class ApiService {
    @inject('configs')
    public configs!: IConfigs;

    private async api<T>(config: AxiosRequestConfig) {
        const baseUrl: string = store.get('ustQuotaViewer:endPoint');
        return axios.request<T>({
            ...config,
            baseURL: baseUrl,
        });
    }

    public async root() {
        const response = await this.api<{ isSuccess: true }>({ url: '/' });
        return response.data;
    }

    public async getQuotas(hour: number) {
        const response = await this.api<IAPIGetQuotas>({ url: '/quotas', params: { hour } });
        return response.data;
    }
}
