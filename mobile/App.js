import './src/config/reactotronConfig';
import React, {useEffect} from 'react';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {StatusBar} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {darken} from 'polished';
import OneSignal from 'react-native-onesignal';
import {appStore, appPersistor} from './src/appStore/appStore';
import createRouter from './routes';
import {appColors} from './src/utils/appColors';
import appConstants from './src/utils/appConstants';
import {setPushId} from './src/appStore/appModules/auth/actions';

function DevDoido() {
  const dispatch = useDispatch();
  const signed = useSelector(state => state.auth.signed);
  const Routes = createRouter(signed);
  const onIds = data => {
    if (!signed) {
      dispatch(setPushId({pushId: data.userId, pushToken: data.pushToken}));
    }
  };
  useEffect(() => {
    OneSignal.init(appConstants.ONE_SIGNAL_KEY);
    OneSignal.addEventListener('ids', onIds);
    return () => OneSignal.removeEventListener('ids', onIds);
  }, []);
  return <Routes />;
}

const App = () => {
  return (
    <Provider store={appStore}>
      <PersistGate persistor={appPersistor}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={darken(0.2, appColors.primary)}
        />
        <PaperProvider>
          <DevDoido />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
