import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';

// Import the logo image (correct relative path to project `assets` folder)
const agriFLOLogo = require('../assets/images/AgriFlo-logo.jpg');

type User = { fullName?: string; email: string; password?: string; method?: 'manual' | 'google' };

type Props = {
  showLogin: boolean;
  signupFullName: string;
  setSignupFullName: (v: string) => void;
  signupEmail: string;
  setSignupEmail: (v: string) => void;
  signupPassword: string;
  setSignupPassword: (v: string) => void;
  signupConfirm: string;
  setSignupConfirm: (v: string) => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  handleManualSignup: () => void;
  handleManualLogin: () => void;
  handleGoogleSignIn: () => void;
  setShowLogin: (v: boolean) => void;
};

export default function LoginScreen({
  showLogin,
  signupFullName,
  setSignupFullName,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupConfirm,
  setSignupConfirm,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  handleManualSignup,
  handleManualLogin,
  handleGoogleSignIn,
  setShowLogin,
}: Props) {
  return (
    <ScrollView contentContainerStyle={styles.loginScrollContainer} style={{ backgroundColor: '#0f0f0f' }}>
      <View style={styles.loginFormContainer}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image source={agriFLOLogo} style={styles.logoImage} />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.loginTitle}>Agriflo Waterwise System</Text>
          <Text style={styles.loginSubtitle}>Welcome to your smart irrigation dashboard</Text>
        </View>

        {/* Google Sign-In */}
        <TouchableOpacity style={styles.googleSignInBtn} onPress={handleGoogleSignIn}>
          <Text style={styles.googleSignInText}>🔐 Sign in with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual Signup/Login Form */}
        {showLogin ? (
          <View style={styles.formSection}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#666"
              style={styles.modernInput}
              value={signupFullName}
              onChangeText={setSignupFullName}
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#666"
              style={styles.modernInput}
              value={signupEmail}
              onChangeText={setSignupEmail}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#666"
              style={styles.modernInput}
              secureTextEntry
              value={signupPassword}
              onChangeText={setSignupPassword}
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              style={styles.modernInput}
              secureTextEntry
              value={signupConfirm}
              onChangeText={setSignupConfirm}
            />
            <TouchableOpacity style={styles.signUpBtn} onPress={handleManualSignup}>
              <Text style={styles.signUpBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#666"
              style={styles.modernInput}
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#666"
              style={styles.modernInput}
              secureTextEntry
              value={loginPassword}
              onChangeText={setLoginPassword}
            />
            <TouchableOpacity style={styles.signUpBtn} onPress={handleManualLogin}>
              <Text style={styles.signUpBtnText}>Log In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Login/Signup Link */}
        <View style={styles.loginLinkSection}>
          <Text style={styles.loginLinkText}>
            {showLogin ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setShowLogin(!showLogin)}>
            <Text style={styles.loginLinkButton}>
              {showLogin ? 'Log in here' : 'Sign up here'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Login Page Styles
  loginScrollContainer: { flexGrow: 1, padding: 20, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center', minHeight: '100%' },
  loginFormContainer: { width: '100%', maxWidth: 400, backgroundColor: '#1c1c1c', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 5 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoImage: { width: 100, height: 100, borderRadius: 16, backgroundColor: '#27d1ff20' },
  titleSection: { alignItems: 'center', marginBottom: 24 },
  loginTitle: { fontSize: 24, fontWeight: '700', color: '#27d1ff', textAlign: 'center', marginBottom: 8 },
  loginSubtitle: { color: '#9ad9e6', textAlign: 'center', fontSize: 14, lineHeight: 20 },

  // Google Sign-In Button
  googleSignInBtn: { width: '100%', backgroundColor: '#fff', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  googleSignInText: { fontSize: 15, fontWeight: '600', color: '#1c1c1c' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#666', marginHorizontal: 12, fontSize: 12, fontWeight: '600' },

  // Form Section
  formSection: { width: '100%', marginBottom: 20 },
  modernInput: { backgroundColor: '#111', color: '#fff', borderColor: '#27d1ff', borderWidth: 1.5, padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 15, fontFamily: 'System' },
  signUpBtn: { width: '100%', backgroundColor: '#27d1ff', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#27d1ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  signUpBtnText: { color: '#0f0f0f', fontSize: 16, fontWeight: '700' },

  // Login Link Section
  loginLinkSection: { alignItems: 'center' },
  loginLinkText: { color: '#999', fontSize: 14, marginBottom: 8 },
  loginLinkButton: { color: '#27d1ff', fontSize: 14, fontWeight: '600' },
});
