import {
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
  Linking,
  Alert,
  Modal,
  Text,
} from 'react-native';
import React, {FC, useContext, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppService, RootStackParamList} from '../../types';
import {useTheme} from '@react-navigation/native';
import TText from '../components/TText';
import {AuthContext} from '../utils/AuthContext';
import {UserInfo} from 'react-native-auth0';
import SvgQuantacoLogo from '../components/QuantacoLogo';

const {width: screenW} = Dimensions.get('window');

const AppServices: AppService[] = [
  {
    serviceId: 1,
    serviceName: 'Salesline',
    serviceUrl: 'http://salesline.quantaco.co',
    enabled: true,
  },
  {
    serviceId: 2,
    serviceName: 'Cashup',
    serviceUrl: 'http://cashup.quantaco.co',
    enabled: true,
  },
  {
    serviceId: 3,
    serviceName: 'Compliance',
    serviceUrl: 'http://compliance.quantaco.co',
    enabled: true,
  },
  {
    serviceId: 4,
    serviceName: 'Hospitality Platform',
    serviceUrl: 'http://compliance.quantaco.co',
    enabled: false,
  },
  {
    serviceId: 5,
    serviceName: 'Slack (Android)',
    serviceUrl: 'https://slack.com',
    enabled: true,
    androidUrl: 'slack://open',
  },
  {
    serviceId: 6,
    serviceName: 'Send Mail (ios)',
    serviceUrl: 'https://gmail.com',
    enabled: true,
    iosUrl: 'mailto:example@quantaco.co',
  },
];

const Home: FC<NativeStackScreenProps<RootStackParamList, 'Home'>> = ({
  navigation,
}) => {
  const {colors} = useTheme();
  const [showAccessTokenModal, setShowAccessTokenModal] = useState(false);
  const authContext = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        if (authContext?.auth0 && authContext.credentials?.accessToken) {
          console.log('triggered getUserInfo');
          const profile = await authContext.auth0.auth.userInfo({
            token: authContext.credentials.accessToken,
          });
          console.log(profile);
          setUserInfo(profile);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (authContext) {
      getUserInfo();
    }
  }, [authContext]);

  const handlePressAppService = async (serv: AppService) => {
    if (Platform.OS === 'android' && serv.androidUrl) {
      try {
        await Linking.openURL(serv.androidUrl);
      } catch (error) {
        console.log(error);
        await Linking.openURL(serv.serviceUrl);
      }
    } else if (Platform.OS === 'ios' && serv.iosUrl) {
      try {
        await Linking.openURL(serv.iosUrl);
      } catch (error) {
        console.log(error);
        await Linking.openURL(serv.serviceUrl);
      }
    } else {
      // @ts-ignore
      return navigation.navigate(serv.serviceName);
    }
  };

  const handleLogout = () => {
    if (authContext) {
      // console.log(
      //   authContext.auth0.auth.logoutUrl({federated: true, returnTo: 'Home'}),
      // );
      authContext.auth0.webAuth
        .clearSession()
        .then(() => {
          Alert.alert('Logged out!');
          authContext.setCredentials(null);
        })
        .catch(() => {
          Alert.alert('There was a problem logging out!');
          authContext.setCredentials(null);
          console.log('Log out cancelled');
        });
    }
  };

  const handleShowAccessToken = () => {
    setShowAccessTokenModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          height: 30,
          width: '100%',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginVertical: 16,
        }}>
        <SvgQuantacoLogo
          height={60}
          width={'100%'}
          viewBox="0 0 500 140"
          letterColor={colors.text}
          dotColor="#FF6A14"
        />
      </View>
      <TText>{`Good morning ${userInfo?.nickname}`}</TText>
      <View style={styles.buttonContainer}>
        <ScrollView
          contentContainerStyle={styles.buttonSection}
          bounces={false}>
          {AppServices.map(serv => (
            <TouchableOpacity
              key={serv.serviceId}
              disabled={!serv.enabled}
              onPress={() => handlePressAppService(serv)}>
              <View
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.border,
                    opacity: !serv.enabled ? 0.5 : 1,
                  },
                ]}>
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: 'RedHatDisplay-Regular',
                  }}>
                  {serv.serviceName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleShowAccessToken}>
            <View
              style={[
                styles.button,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.border,
                },
              ]}>
              <TText>Show access token</TText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <View
              style={[
                styles.button,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.border,
                },
              ]}>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: 'RedHatDisplay-Italic',
                }}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {authContext?.credentials?.accessToken && (
        <Modal
          animationType="slide"
          transparent
          visible={showAccessTokenModal}
          onRequestClose={() => setShowAccessTokenModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text>{authContext.credentials.accessToken}</Text>
              <TouchableOpacity onPress={() => setShowAccessTokenModal(false)}>
                <View
                  style={[
                    styles.button,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.border,
                    },
                  ]}>
                  <TText>Close Modal</TText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    flex: 1,
  },
  buttonSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  button: {
    width: screenW * 0.4,
    marginVertical: 4,
    height: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.26,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    backgroundColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Home;
