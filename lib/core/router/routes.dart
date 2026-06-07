class Routes {
  const Routes._();

  static const signIn = '/sign-in';
  static const signUp = '/sign-up';
  static const resetPassword = '/reset-password';
  static const onboardProfile = '/onboard-profile';

  static const home = '/home';
  static const matches = '/matches';
  static const chats = '/chats';
  static const profile = '/profile';

  static const myCars = '/my-cars';
  static const createCar = '/cars/new';
  static const editCar = '/cars/:carId/edit';
  static const carPreferences = '/cars/:carId/preferences';

  static const chatRoom = '/chats/:matchId';
  static const paywall = '/paywall';
  static const report = '/report';

  static String chatRoomFor(String matchId) => '/chats/$matchId';
  static String editCarFor(String carId) => '/cars/$carId/edit';
  static String prefsFor(String carId) => '/cars/$carId/preferences';
}
