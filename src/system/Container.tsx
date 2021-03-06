import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Container } from "inversify";
import { ApiService } from "../services/ApiService";
import { configs } from "./configs";

type classType = new (...args: any[]) => any;

const createContainer = (): Container => {
  const container = new Container();
  container.bind("configs").toConstantValue(configs);
  container.bind(ApiService).toSelf().inSingletonScope();
  return container;
};

const AppContextProvider = () => {
  const container = useMemo(() => createContainer(), []);
  const getService = <T extends classType>(
    serviceClass: T
  ): InstanceType<T> => {
    return container.get(serviceClass);
  };

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [apiServerEndpoint, setApiServerEndpoint] = useState<
    string | undefined
  >(undefined);

  return {
    container,
    getService,

    isDarkTheme,
    setIsDarkTheme,
    apiServerEndpoint,
    setApiServerEndpoint,
  };
};

const AppContext = createContext<ReturnType<typeof AppContextProvider>>(
  null as any
);

export function useAppContext() {
  return useContext(AppContext);
}

// the provider
export const ContextProvider = (props: { children: ReactNode }) => {
  return (
    <AppContext.Provider value={AppContextProvider()}>
      <AppContext.Consumer>{(c) => props.children}</AppContext.Consumer>
    </AppContext.Provider>
  );
};
