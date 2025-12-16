import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  Platform,
  Alert,
  Image,
  Dimensions,
  Animated,
  Pressable,
  StyleSheet,
} from 'react-native';
import LoginScreen from './LoginScreen';

// Import with fallback for missing packages
let Picker: any = null;
let Notifications: any = null;
let useRouter: any = null;
let AsyncStorage: any = null;

// Picker import
try {
  const pickerModule = require('@react-native-picker/picker');
  Picker = pickerModule.Picker || pickerModule.default?.Picker;
  if (!Picker) {
    throw new Error('Picker not found');
  }
} catch (e) {
  console.warn('Picker not available, using fallback:', e);
  // Fallback Picker component
  Picker = ({ children, ...props }: any) => {
    return <View>{children}</View>;
  };
  Picker.Item = ({ label, value }: any) => null;
}

// Notifications import
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('Notifications not available:', e);
  Notifications = {
    scheduleNotificationAsync: async () => {},
  };
}

// Router import
try {
  const routerModule = require('expo-router');
  useRouter = routerModule.useRouter;
  if (!useRouter) {
    throw new Error('useRouter not found');
  }
} catch (e) {
  console.warn('expo-router not available, using fallback:', e);
  useRouter = () => ({
    push: (path: string) => {
      console.log('Router push (fallback):', path);
    },
  });
}

// AsyncStorage import
try {
  const storageModule = require('@react-native-async-storage/async-storage');
  AsyncStorage = storageModule.default || storageModule;
  if (!AsyncStorage) {
    throw new Error('AsyncStorage not found');
  }
} catch (e) {
  console.warn('AsyncStorage not available, using fallback:', e);
  AsyncStorage = {
    setItem: async () => {},
    getItem: async () => null,
    removeItem: async () => {},
  };
}

// Import the logo image (correct relative path to project `assets` folder)
const agriFLOLogo = require('../assets/images/AgriFlo-logo.jpg');

const storageFallback: { [key: string]: string } = {};
async function storeItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    storageFallback[key] = value;
  }
}
async function getItem(key: string) {
  try {
    const v = await AsyncStorage.getItem(key);
    return v;
  } catch (e) {
    return storageFallback[key] ?? null;
  }
}
async function removeItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    delete storageFallback[key];
  }
}

type User = { fullName?: string; email: string; password?: string; method?: 'manual' | 'google' };

type AlertLog = {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
};

export default function Dashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isSignup, setIsSignup] = useState(true);

  const [temp, setTemp] = useState<number>(27);
  const [water, setWater] = useState<number>(65);
  const [mode, setMode] = useState<'On' | 'Off' | 'Automatic'>('On');

  // ESP32 connection states
  const [esp32IP, setEsp32IP] = useState<string>('192.168.1.39');  // Replace with your ESP32's IP
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [humidity, setHumidity] = useState<number>(50);
  const [pumpArmed, setPumpArmed] = useState<boolean>(false);

  const [notifVolume, setNotifVolume] = useState<number>(50);
  const [alertVolume, setAlertVolume] = useState<number>(70);

  const [wifiNetworks] = useState<string[]>(['Home_WiFi', 'Office_Network', 'CTU-Danao', 'Guest_WiFi']);
  const [selectedWifi, setSelectedWifi] = useState<string | null>(null);

  // schedule & timer
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [timerText, setTimerText] = useState<string>('No timer set');
  const [targetTime, setTargetTime] = useState<Date | null>(null);
  const [scheduleDatePicker, setScheduleDatePicker] = useState<Date>(new Date());
  const [timerDatePicker, setTimerDatePicker] = useState<Date>(new Date());
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date>(new Date());
  const [scheduledDays, setScheduledDays] = useState<Set<string>>(new Set());
  const [scheduleStartTime, setScheduleStartTime] = useState<string>('08:00');
  const [scheduleEndTime, setScheduleEndTime] = useState<string>('18:00');
  const [scheduleRepeat, setScheduleRepeat] = useState<'once' | 'daily' | 'weekly'>('once');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Alert thresholds and settings
  const [minWaterLevel, setMinWaterLevel] = useState<number>(20);
  const [maxTemp, setMaxTemp] = useState<number>(35);
  const [minTemp, setMinTemp] = useState<number>(20);
  const [waterLevelAlertEnabled, setWaterLevelAlertEnabled] = useState(true);
  const [maxTempAlertEnabled, setMaxTempAlertEnabled] = useState(true);
  const [minTempAlertEnabled, setMinTempAlertEnabled] = useState(true);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [currentAlert, setCurrentAlert] = useState<AlertLog | null>(null);
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);
  const [alertSettingsVisible, setAlertSettingsVisible] = useState(false);

  // Cooling automation
  const [coolingTriggerTemp, setCoolingTriggerTemp] = useState<number>(30);
  const [coolingSettingsVisible, setCoolingSettingsVisible] = useState(false);
  const [isCooling, setIsCooling] = useState(false);

  // Refill automation
  const [refillPoint, setRefillPoint] = useState<number>(25);
  const [refillMaxPoint, setRefillMaxPoint] = useState<number>(95);
  const [refillSettingsVisible, setRefillSettingsVisible] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);

  // Quick actions
  const [boostActive, setBoostActive] = useState(false);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState(0);
  const [forceRefillActive, setForceRefillActive] = useState(false);
  const [previousMode, setPreviousMode] = useState<'On' | 'Off' | 'Automatic'>('Automatic');

  // Component status
  const [pumpStatus, setPumpStatus] = useState<'online' | 'offline' | 'fault'>('online');
  const [refillValveStatus, setRefillValveStatus] = useState<'online' | 'offline' | 'fault'>('online');
  const [deviceConnected, setDeviceConnected] = useState(true);

  // login form
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // overlays
  const [soundVisible, setSoundVisible] = useState(false);
  const [wifiVisible, setWifiVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [scheduleConfigVisible, setScheduleConfigVisible] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const logged = (await getItem('isLoggedIn')) === 'true';
      const userStr = await getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUser(u);
          setIsLoggedIn(logged ?? false);
          setShowLogin(!logged);
        } catch {}
      }
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            Alert.alert('Timer Finished', 'Irrigation timer completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timerActive, timerSeconds]);

  // Update timer display
  useEffect(() => {
    const hours = Math.floor(timerSeconds / 3600);
    const mins = Math.floor((timerSeconds % 3600) / 60);
    const secs = timerSeconds % 60;
    if (timerActive) {
      setTimerText(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }
  }, [timerSeconds, timerActive]);

  useEffect(() => {
    if (targetTime) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const diff = targetTime.getTime() - new Date().getTime();
        if (diff <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setTargetTime(null);
          setTimerText('No timer set');
          Alert.alert('Timer Finished');
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimerText(`Remaining: ${mins}m ${secs}s`);
        }
      }, 1000) as unknown as number;
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [targetTime]);

  function showAlert(msg: string) {
    Alert.alert(msg);
  }

  // Log alert and send notification
  function logAlert(type: 'critical' | 'warning' | 'info', message: string) {
    const newAlert: AlertLog = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    };
    setAlertLogs((prev) => [newAlert, ...prev]);
    setCurrentAlert(newAlert);

    // Send push notification for critical and warning
    if ((type === 'critical' || type === 'warning') && isLoggedIn) {
      sendPushNotification(type, message);
    }
  }

  // Send push notification
  async function sendPushNotification(type: 'critical' | 'warning' | 'info', message: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: type === 'critical' ? '🚨 CRITICAL ALERT' : '⚠️ WARNING',
          body: message,
          data: { type, message },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      console.log('Notification error:', e);
    }
  }

  // Fetch data from ESP32
  const fetchESP32Data = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`http://${esp32IP}/sensor`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (mode !== 'Off') {
        setTemp(data.temperature);
        setWater(data.water_level);
      }
      setHumidity(data.humidity);
      setPumpArmed(data.pump_armed === "true");
      // Update pump status
      setPumpStatus(data.pump_status === "ON" ? 'online' : 'offline');
      setEsp32Connected(true);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('ESP32 fetch timeout');
      } else {
        console.error('ESP32 connection failed:', error);
      }
      setEsp32Connected(false);
      setPumpStatus('offline'); // Assume offline on error
    }
  };

  // Arm/Disarm pump
  const armPump = async () => {
    try {
      await fetch(`http://${esp32IP}/pump/arm`, { method: 'POST' });
      setPumpArmed(true);
    } catch (error) {
      console.error('Failed to arm pump:', error);
    }
  };

  const disarmPump = async () => {
    try {
      await fetch(`http://${esp32IP}/pump/disarm`, { method: 'POST' });
      setPumpArmed(false);
    } catch (error) {
      console.error('Failed to disarm pump:', error);
    }
  };

  // Check thresholds and trigger alerts
  function checkThresholds() {
    if (mode === 'Off') return; // No alerts in Off mode

    // Water level alerts at 25%
    if (waterLevelAlertEnabled && water <= 25) {
      logAlert('critical', `🚨 Water Level Low — ${water}%, below 25% threshold`);
    }

    // Auto-clear alert when water rises above 25%
    if (water > 25 && currentAlert && currentAlert.message.includes('Water Level Low')) {
      setCurrentAlert(null);
    }

    // Temperature alerts with critical threshold at 35°C
    if (maxTempAlertEnabled && temp >= 35) {
      logAlert('critical', `🚨 CRITICAL: Temperature Extremely High — ${temp}°C, reached critical threshold (≥ 35°C)`);
    } else if (maxTempAlertEnabled && temp >= maxTemp) {
      logAlert('warning', `⚠️ Temperature High — ${temp}°C, reached ${maxTemp}°C threshold`);
    }

    if (minTempAlertEnabled && temp < minTemp) {
      logAlert('warning', `⚠️ Temperature Low — ${temp}°C, below ${minTemp}°C threshold`);
    }

    // Failed automation alerts
    if (mode === 'Automatic' && temp >= coolingTriggerTemp && !isCooling) {
      logAlert('critical', `🚨 CRITICAL: Cooling Automation Failed — Temperature at ${temp}°C (≥ trigger ${coolingTriggerTemp}°C) but sprinkler is not running!`);
    }
    if (mode === 'Automatic' && water <= refillPoint && !isRefilling) {
      logAlert('critical', `🚨 CRITICAL: Refill Automation Failed — Water at ${water}% (≤ trigger ${refillPoint}%) but valve is not opening!`);
    }
  }

  // Format alert logs by date
  function getFormattedAlerts() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const categorized: { [key: string]: AlertLog[] } = {
      Today: [],
      Yesterday: [],
      'Last Week': [],
      Older: [],
    };

    alertLogs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      const logDay = logDate.toDateString();
      const todayString = today.toDateString();
      const yesterdayString = yesterday.toDateString();

      if (logDay === todayString) {
        categorized['Today'].push(log);
      } else if (logDay === yesterdayString) {
        categorized['Yesterday'].push(log);
      } else if (logDate > weekAgo) {
        categorized['Last Week'].push(log);
      } else {
        categorized['Older'].push(log);
      }
    });

    // Convert to array of sections with date label
    return Object.entries(categorized)
      .filter(([_, alerts]) => alerts.length > 0)
      .map(([date, alerts]) => ({ date, alerts }));
  }

  // Check thresholds periodically
  useEffect(() => {
    if (isLoggedIn) {
      const checkInterval = setInterval(() => {
        checkThresholds();
      }, 5000); // Check every 5 seconds
      return () => clearInterval(checkInterval);
    }
  }, [isLoggedIn, water, temp, minWaterLevel, maxTemp, minTemp, waterLevelAlertEnabled, maxTempAlertEnabled, minTempAlertEnabled]);

  // Fetch ESP32 data periodically
  useEffect(() => {
    if (isLoggedIn && esp32IP) {
      fetchESP32Data();
      const interval = setInterval(fetchESP32Data, 5000); // Fetch every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, esp32IP]);

  // Cooling automation - respects mode hierarchy
  useEffect(() => {
    if (isLoggedIn) {
      if (mode === 'Automatic') {
        // Normal automation behavior
        if (temp >= coolingTriggerTemp && !isCooling) {
          setIsCooling(true);
          logAlert('critical', `🌡️ Temperature trigger activated! Current: ${temp}°C ≥ Trigger: ${coolingTriggerTemp}°C. Sprinkler turned ON.`);
        } else if (isCooling && temp < coolingTriggerTemp - 2) {
          // Hysteresis: turn off when temp drops 2 degrees below trigger
          setIsCooling(false);
        }
      } else if (mode === 'On') {
        // On mode: sprinkler always on (unless boost/quick action in progress)
        if (!isCooling) {
          setIsCooling(true);
        }
      } else if (mode === 'Off') {
        // Off mode: all systems disabled
        if (isCooling) {
          setIsCooling(false);
        }
      }

      // Alert if temp reaches trigger but system is disabled
      if ((mode === 'Off' || mode === 'On') && temp >= coolingTriggerTemp && !isCooling) {
        logAlert('critical', `🚨 CRITICAL: Temperature at trigger point (${temp}°C) but Automatic Mode is OFF! System not cooling.`);
      }
    }
  }, [isLoggedIn, temp, coolingTriggerTemp, mode, isCooling]);

  // Refill automation - respects mode hierarchy and force refill
  useEffect(() => {
    if (isLoggedIn) {
      if (mode === 'Automatic' && !forceRefillActive) {
        // Normal automation behavior
        if (water <= refillPoint && !isRefilling) {
          setIsRefilling(true);
          logAlert('critical', `💧 Water refill point reached! Current: ${water}% ≤ Threshold: ${refillPoint}%. Valve opened for refill.`);
        } else if (isRefilling && water >= refillMaxPoint) {
          setIsRefilling(false);
          logAlert('info', `✓ Tank refilled to maximum (${water}%). Valve closed.`);
        }
      } else if (forceRefillActive) {
        // Force refill active - always refilling until max
        if (!isRefilling) {
          setIsRefilling(true);
        }
      } else if (mode === 'Off') {
        // Off mode: disable refilling
        if (isRefilling) {
          setIsRefilling(false);
        }
      }
    }
  }, [isLoggedIn, water, refillPoint, refillMaxPoint, isRefilling, mode, forceRefillActive]);

  function handleManualSignup() {
    if (!signupFullName || !signupEmail || !signupPassword || !signupConfirm) {
      showAlert('All fields are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      showAlert('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      showAlert('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      showAlert('Passwords do not match.');
      return;
    }
    const newUser: User = { fullName: signupFullName, email: signupEmail, password: signupPassword, method: 'manual' };
    // persist users array
    (async () => {
      const usersStr = await getItem('users');
      const usersArr = usersStr ? JSON.parse(usersStr) : [];
      usersArr.push(newUser);
      await storeItem('users', JSON.stringify(usersArr));
      await storeItem('user', JSON.stringify({ fullName: signupFullName, email: signupEmail, method: 'manual' }));
      await storeItem('isLoggedIn', 'true');
      setUser({ fullName: signupFullName, email: signupEmail, method: 'manual' });
      setIsLoggedIn(true);
      setShowLogin(false);
      showAlert('Signed up and logged in');
    })();
  }

  function handleManualLogin() {
    if (!loginEmail || !loginPassword) {
      showAlert('All fields are required.');
      return;
    }
    (async () => {
      const usersStr = await getItem('users');
      const usersArr = usersStr ? JSON.parse(usersStr) : [];
      const existing = usersArr.find((u: any) => u.email === loginEmail && u.password === loginPassword);
      if (!existing) {
        showAlert('Invalid email or password.');
        return;
      }
      await storeItem('user', JSON.stringify({ fullName: existing.fullName, email: existing.email, method: 'manual' }));
      await storeItem('isLoggedIn', 'true');
      setUser({ fullName: existing.fullName, email: existing.email, method: 'manual' });
      setIsLoggedIn(true);
      setShowLogin(false);
      showAlert('Logged in');
    })();
  }

  function handleLogout() {
    (async () => {
      await removeItem('isLoggedIn');
      await removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      setShowLogin(true);
    })();
  }

  async function handleGoogleSignIn() {
    try {
      // Placeholder: expo-auth-session requires your Google OAuth client ID
      // For now, simulate a successful Google login
      showAlert('Google Sign-In: Add your Google OAuth client ID in app.json or .env');
      const mockGoogleUser: User = {
        fullName: 'Google User',
        email: 'user@gmail.com',
        method: 'google',
      };
      await storeItem('user', JSON.stringify(mockGoogleUser));
      await storeItem('isLoggedIn', 'true');
      setUser(mockGoogleUser);
      setIsLoggedIn(true);
      setShowLogin(false);
    } catch (e) {
      showAlert('Google Sign-In failed');
    }
  }

  function setModeLocal(m: 'On' | 'Off' | 'Automatic') {
    setMode(m);
    if (m === 'Off') {
      setTemp(0);
      setWater(0);
      setAlertLogs([]); // Reset all notifications
      setCurrentAlert(null); // Turn off current alert
      disarmPump(); // Disarm pump
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTargetTime(null);
        setTimerText('No timer set');
      }
    } else {
      armPump(); // Arm pump for On or Automatic
    }
  }

  function openSchedule(dt: string) {
    if (!dt) return;
    setScheduleDate(dt);
    showAlert('Scheduled on: ' + new Date(dt).toLocaleString());
  }

  function setTimerFromTime(timeStr: string) {
    if (!timeStr) return;
    // timeStr like HH:MM
    const now = new Date();
    const [hh, mm] = timeStr.split(':').map((s) => parseInt(s, 10));
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
    setTargetTime(t);
    setTimerText('Timer set');
  }

  // Calendar helper: get days in month
  function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  // Calendar helper: get first day of month (0-6, 0=Sun)
  function getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  // Toggle schedule day selection
  function toggleScheduleDay(day: number) {
    const dateKey = `${selectedScheduleDate.getFullYear()}-${selectedScheduleDate.getMonth()}-${day}`;
    const newDays = new Set(scheduledDays);
    if (newDays.has(dateKey)) {
      newDays.delete(dateKey);
    } else {
      newDays.add(dateKey);
    }
    setScheduledDays(newDays);
  }

  // Save schedule configuration
  function saveScheduleConfig() {
    // Validate mode
    if (mode !== 'Automatic') {
      showAlert('System must be in Automatic Mode to activate scheduling.');
      return;
    }
    
    if (scheduledDays.size === 0) {
      showAlert('Please select at least one day');
      return;
    }
    showAlert(`Schedule saved for ${scheduledDays.size} day(s)\nTime: ${scheduleStartTime} - ${scheduleEndTime}\nRepeat: ${scheduleRepeat}`);
    setScheduleConfigVisible(false);
    setScheduleVisible(false);
  }

  // Start one-time irrigation timer
  function startIrrigationTimer() {
    // Validate mode
    if (mode !== 'Automatic') {
      showAlert('System must be in Automatic Mode to activate scheduling.');
      return;
    }
    
    const totalSeconds = (timerDatePicker.getHours() * 3600) + (timerDatePicker.getMinutes() * 60) + timerDatePicker.getSeconds();
    if (totalSeconds <= 0) {
      showAlert('Please set a duration greater than 0');
      return;
    }
    setTimerSeconds(totalSeconds);
    setTimerActive(true);
    setTimerVisible(false);
  }

  // Cancel active timer
  function cancelTimer() {
    setTimerActive(false);
    setTimerSeconds(0);
    setTimerText('No timer set');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Quick action: Sprinkler Boost (5 minutes)
  function activateSprinklerBoost() {
    if (boostActive) {
      showAlert('Boost already active');
      return;
    }
    setPreviousMode(mode);
    setMode('On');
    setBoostActive(true);
    setBoostTimeRemaining(300); // 5 minutes in seconds
    logAlert('info', '💨 Sprinkler Boost activated for 1 minute');
  }

  // Boost timer countdown
  useEffect(() => {
    if (boostActive && boostTimeRemaining > 0) {
      const interval = setInterval(() => {
        setBoostTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (boostActive && boostTimeRemaining === 0) {
      setBoostActive(false);
      setMode(previousMode);
      logAlert('info', '✓ Sprinkler Boost ended. System returned to ' + previousMode + ' mode');
    }
  }, [boostActive, boostTimeRemaining, previousMode]);

  // Quick action: Force Refill
  function activateForceRefill() {
    if (water >= refillMaxPoint) {
      showAlert('Tank is already at maximum capacity');
      return;
    }
    setForceRefillActive(true);
    setPreviousMode(mode);
    setMode('On');
    logAlert('info', '💧 Force Refill activated. Valve opened');
  }

  // Disable force refill when tank is full
  useEffect(() => {
    if (forceRefillActive && water >= refillMaxPoint) {
      setForceRefillActive(false);
      setMode(previousMode);
      logAlert('info', '✓ Tank refilled to maximum. Valve closed. System returned to ' + previousMode + ' mode');
    }
  }, [forceRefillActive, water, refillMaxPoint, previousMode]);

  return (
    <View style={styles.rootContainer}>
      {showLogin && (
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
            <View style={styles.formSection}>
              {isSignup ? (
                <>
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#666"
                    style={styles.modernInput}
                    value={signupFullName}
                    onChangeText={setSignupFullName}
                    editable={showLogin}
                  />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#666"
                    style={styles.modernInput}
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                    keyboardType="email-address"
                    editable={showLogin}
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    style={styles.modernInput}
                    secureTextEntry
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                    editable={showLogin}
                  />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#666"
                    style={styles.modernInput}
                    secureTextEntry
                    value={signupConfirm}
                    onChangeText={setSignupConfirm}
                    editable={showLogin}
                  />
                  <TouchableOpacity style={styles.signUpBtn} onPress={handleManualSignup}>
                    <Text style={styles.signUpBtnText}>Create Account</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#666"
                    style={styles.modernInput}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    editable={showLogin}
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    style={styles.modernInput}
                    secureTextEntry
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    editable={showLogin}
                  />
                  <TouchableOpacity style={styles.signUpBtn} onPress={handleManualLogin}>
                    <Text style={styles.signUpBtnText}>Log In</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Login/Signup Link */}
            <View style={styles.loginLinkSection}>
              <Text style={styles.loginLinkText}>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                <Text style={styles.loginLinkButton}>
                  {isSignup ? 'Log in here' : 'Sign up here'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {!showLogin && (
        <View style={styles.main}>
          {/* Hamburger Navigation Drawer */}
          <Modal visible={drawerVisible} animationType="fade" transparent onRequestClose={() => setDrawerVisible(false)}>
            <View style={styles.drawerOverlay}>
              <View style={styles.drawer}>
                {/* Logo and Title */}
                <View style={styles.drawerHeader}>
                  <Image source={agriFLOLogo} style={{ width: 50, height: 50, borderRadius: 8 }} />
                  <Text style={styles.drawerTitle}>Agriflo Waterwise System</Text>
                </View>

                {/* Navigation Items */}
                <TouchableOpacity style={styles.drawerItem} onPress={() => setDrawerVisible(false)}>
                  <Text style={styles.drawerItemText}>📊 Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.drawerItem} onPress={() => setDrawerVisible(false)}>
                  <Text style={styles.drawerItemText}>👤 Account</Text>
                </TouchableOpacity>

                {/* Settings with Submenu */}
                <View>
                  <TouchableOpacity style={styles.drawerItem} onPress={() => setSettingsExpanded(!settingsExpanded)}>
                    <Text style={styles.drawerItemText}>⚙️ Settings</Text>
                    <Text style={{ color: '#9ad9e6' }}>{settingsExpanded ? '▼' : '▶'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.drawerItem, { marginTop: 8 }]} onPress={() => { setDrawerVisible(false); }}>
                    <Text style={styles.drawerItemText}>📊 Reports</Text>
                  </TouchableOpacity>
                  {settingsExpanded && (
                    <View style={styles.submenu}>
                      <TouchableOpacity style={styles.submenuItem} onPress={() => { setSoundVisible(true); setDrawerVisible(false); }}>
                        <Text style={styles.submenuItemText}>🔊 Sound</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.submenuItem} onPress={() => { setWifiVisible(true); setDrawerVisible(false); }}>
                        <Text style={styles.submenuItemText}>📶 WiFi</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.submenuItem} onPress={() => { setAlertSettingsVisible(true); setDrawerVisible(false); }}>
                        <Text style={styles.submenuItemText}>🚨 Alerts & Notifications</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Logout at Bottom */}
                <TouchableOpacity style={styles.drawerLogout} onPress={handleLogout}>
                  <Text style={styles.drawerLogoutText}>🚪 Logout</Text>
                </TouchableOpacity>
              </View>

              {/* Close drawer on backdrop press */}
              <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerVisible(false)} />
            </View>
          </Modal>

          {/* Top Bar */}
          <View style={[styles.topbar, { paddingTop: Platform.OS === 'android' ? 32 : 12, marginTop: 8 }]}>
            <TouchableOpacity onPress={() => setDrawerVisible(true)}>
              <Text style={{ color: '#9ad9e6', fontSize: 28 }}>☰</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Dashboard</Text>
            <TouchableOpacity onPress={() => setNotificationCenterVisible(true)}>
              <Text style={{ color: '#ff6b6b', fontSize: 24 }}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Alert Banner */}
          {currentAlert && (
            <View style={[
              styles.alertBanner,
              { backgroundColor: currentAlert.type === 'critical' ? '#ff6b6b' : currentAlert.type === 'warning' ? '#ffd93d' : '#6dd5ff' }
            ]}>
              <Text style={[
                styles.alertBannerText,
                { color: currentAlert.type === 'critical' ? '#fff' : '#000' }
              ]}>
                {currentAlert.type === 'critical' ? '🚨' : currentAlert.type === 'warning' ? '⚠️' : 'ℹ️'} {currentAlert.message}
              </Text>
            </View>
          )}

          <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
            {/* Cards Container */}
            <View style={{ flex: 1 }}>
              {/* Temperature and Water Level - Side by Side */}
              <View style={[styles.cards, { flex: 1 }]}>
                <TouchableOpacity style={[styles.card, styles.compactCard]} onPress={() => setCoolingSettingsVisible(true)}>
                  <Text style={styles.cardTitle}>Temperature</Text>
                    <View style={styles.circle}><Text style={{ color: '#27d1ff', fontWeight: 'bold', fontSize: 24 }}>{temp}°C</Text></View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, width: '100%', justifyContent: 'center' }}>
                      <Text style={[styles.value, { fontSize: 11 }]}>Trigger: {coolingTriggerTemp}°C</Text>
                      <TouchableOpacity onPress={() => {}} style={{ marginLeft: 6 }}>
                        <Text style={{ color: '#9ad9e6', fontSize: 14 }}>📊</Text>
                      </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, styles.compactCard]} onPress={() => setRefillSettingsVisible(true)}>
                  <Text style={styles.cardTitle}>Water Level</Text>
                  <View style={styles.circle}><Text style={{ color: '#27d1ff', fontWeight: 'bold', fontSize: 24 }}>{water}%</Text></View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, width: '100%', justifyContent: 'center' }}>
                    <Text style={[styles.value, { fontSize: 11 }]}>Refill: {refillPoint}%</Text>
                    <TouchableOpacity onPress={() => {}} style={{ marginLeft: 6 }}>
                      <Text style={{ color: '#9ad9e6', fontSize: 14 }}>📊</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Schedule and Timer - Side by Side */}
              <View style={[styles.cards, { flex: 1 }]}>
                <View style={[styles.card, styles.compactCard]}>
                  <Text style={styles.cardTitle}>Schedule</Text>
                  <TouchableOpacity style={{ marginTop: 4 }} onPress={() => setScheduleVisible(true)}>
                    <Text style={[styles.icon, { fontSize: 28 }]}>📅</Text>
                  </TouchableOpacity>
                  <Text style={[styles.value, { fontSize: 10 }]}>{scheduleDate ? `${new Date(scheduleDate).toLocaleDateString()}` : 'No schedule'}</Text>
                </View>
                <View style={[styles.card, styles.compactCard]}>
                  <Text style={styles.cardTitle}>Timer</Text>
                  <TouchableOpacity onPress={() => setTimerVisible(true)}>
                    <Text style={[styles.icon, { fontSize: 28 }]}>⏰</Text>
                  </TouchableOpacity>
                  <Text style={[styles.value, { fontSize: 10 }]}>{timerText}</Text>
                </View>
              </View>

              {/* Mode - Full Width */}
              <View style={[styles.card, styles.fullWidthCard, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Mode</Text>
                <View style={styles.modeRow}>
                  <TouchableOpacity style={[styles.modeBtn, styles.modeBtnSmall, mode === 'On' && styles.modeActive]} onPress={() => setModeLocal('On')}>
                    <Text style={[mode === 'On' ? styles.modeActiveText : { color: '#27d1ff' }, { fontSize: 12 }]}>On</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modeBtn, styles.modeBtnSmall, mode === 'Off' && styles.modeActive]} onPress={() => setModeLocal('Off')}>
                    <Text style={[mode === 'Off' ? styles.modeActiveText : { color: '#27d1ff' }, { fontSize: 12 }]}>Off</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modeBtn, styles.modeBtnSmall, mode === 'Automatic' && styles.modeActive]} onPress={() => setModeLocal('Automatic')}>
                    <Text style={[mode === 'Automatic' ? styles.modeActiveText : { color: '#27d1ff' }, { fontSize: 12 }]}>Auto</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.value, { fontSize: 10 }]}>Mode: {mode}</Text>
              </View>

              {/* Component Status and Quick Actions - Side by Side */}
              <View style={[styles.cards, { flex: 1 }]}>
                {/* Component Status Card */}
                <View style={[styles.card, styles.compactCard, { borderWidth: (pumpStatus === 'fault' || refillValveStatus === 'fault' || !esp32Connected) ? 2 : 0, borderColor: '#ff3333' }]}>
                  <Text style={[styles.cardTitle, { fontSize: 14 }]}>🔧 Status</Text>
                  <View style={{ marginTop: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: pumpStatus === 'fault' ? '#ff3333' : pumpStatus === 'offline' ? '#ffaa00' : '#00dd00', fontSize: 11, fontWeight: '600' }}>
                        {pumpStatus === 'fault' ? '⚠️ Pump' : pumpStatus === 'offline' ? '⏸ Pump' : '✓ Pump'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: refillValveStatus === 'fault' ? '#ff3333' : refillValveStatus === 'offline' ? '#ffaa00' : '#00dd00', fontSize: 11, fontWeight: '600' }}>
                        {refillValveStatus === 'fault' ? '⚠️ Valve' : refillValveStatus === 'offline' ? '⏸ Valve' : '✓ Valve'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: pumpArmed ? '#00dd00' : '#ffaa00', fontSize: 11, fontWeight: '600' }}>
                        {pumpArmed ? '✓ Armed' : '⏸ Disarmed'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: esp32Connected ? '#00dd00' : '#ff3333', fontSize: 11, fontWeight: '600' }}>
                        {esp32Connected ? '✓ ESP32' : '⚠️ ESP32'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quick Action Card */}
                <View style={[styles.card, styles.compactCard]}>
                  <Text style={[styles.cardTitle, { fontSize: 14 }]}>⚡ Actions</Text>
                  <View style={styles.quickActionsContainer}>
                    <TouchableOpacity 
                      style={[styles.quickActionBtn, boostActive && styles.quickActionBtnActive]}
                      onPress={activateSprinklerBoost}
                      disabled={boostActive}
                    >
                      <Text style={[styles.quickActionBtnText, boostActive && styles.quickActionBtnTextActive]}>
                        💨 Boost {boostActive ? `${Math.floor(boostTimeRemaining / 60)}:${(boostTimeRemaining % 60).toString().padStart(2, '0')}` : ''}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.quickActionBtn,
                        forceRefillActive && styles.quickActionBtnActive,
                        water >= refillMaxPoint && styles.quickActionBtnDisabled
                      ]}
                      onPress={activateForceRefill}
                      disabled={forceRefillActive || water >= refillMaxPoint}
                    >
                      <Text style={[styles.quickActionBtnText, forceRefillActive && styles.quickActionBtnTextActive]}>
                        💧 Refill {forceRefillActive ? `${water}%` : ''}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Overlays as Modals */}
          <Modal visible={soundVisible} animationType="fade" transparent onRequestClose={() => setSoundVisible(false)}>
            <View style={styles.overlayBackdrop}>
              <View style={styles.overlayPanel}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>🔊 Sound Settings</Text>
                  <TouchableOpacity onPress={() => setSoundVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.settingsCard}>
                    <Text style={styles.settingsLabel}>Notification Volume</Text>
                    <Text style={styles.settingsValue}>{notifVolume}%</Text>
                    <View style={styles.volumeSlider}>
                      <View style={[styles.volumeFill, { width: `${notifVolume}%` }]} />
                    </View>
                    <View style={styles.volumeControls}>
                      <TouchableOpacity style={styles.volumeBtn} onPress={() => setNotifVolume(Math.max(0, notifVolume - 10))}>
                        <Text style={styles.volumeBtnText}>−</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.volumeBtn} onPress={() => setNotifVolume(Math.min(100, notifVolume + 10))}>
                        <Text style={styles.volumeBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.settingsCard}>
                    <Text style={styles.settingsLabel}>Alert Volume</Text>
                    <Text style={styles.settingsValue}>{alertVolume}%</Text>
                    <View style={styles.volumeSlider}>
                      <View style={[styles.volumeFill, { width: `${alertVolume}%` }]} />
                    </View>
                    <View style={styles.volumeControls}>
                      <TouchableOpacity style={styles.volumeBtn} onPress={() => setAlertVolume(Math.max(0, alertVolume - 10))}>
                        <Text style={styles.volumeBtnText}>−</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.volumeBtn} onPress={() => setAlertVolume(Math.min(100, alertVolume + 10))}>
                        <Text style={styles.volumeBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          <Modal visible={wifiVisible} animationType="fade" transparent onRequestClose={() => setWifiVisible(false)}>
            <View style={styles.overlayBackdrop}>
              <View style={styles.overlayPanel}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>📶 WiFi Settings</Text>
                  <TouchableOpacity onPress={() => setWifiVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
                  {wifiNetworks.map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.wifiItem, selectedWifi === n && styles.wifiItemActive]}
                      onPress={() => setSelectedWifi(n)}
                    >
                      <Text style={[styles.wifiItemText, selectedWifi === n && styles.wifiItemTextActive]}>
                        📡 {n}
                      </Text>
                      {selectedWifi === n && <Text style={styles.wifiCheckmark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                  <View style={styles.wifiStatus}>
                    <Text style={styles.wifiStatusLabel}>Connected:</Text>
                    <Text style={styles.wifiStatusValue}>{selectedWifi ?? 'Not connected'}</Text>
                  </View>

                  {/* ESP32 IP Configuration */}
                  <View style={styles.settingsCard}>
                    <Text style={styles.settingsLabel}>ESP32 IP Address</Text>
                    <TextInput
                      placeholder="e.g., 192.168.1.100"
                      placeholderTextColor="#666"
                      style={styles.modernInput}
                      value={esp32IP}
                      onChangeText={setEsp32IP}
                      keyboardType="numeric"
                    />
                    <Text style={styles.settingValue}>Status: {esp32Connected ? '✅ Connected' : '❌ Disconnected'}</Text>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          <Modal visible={scheduleVisible} animationType="slide" onRequestClose={() => { setScheduleVisible(false); setScheduleConfigVisible(false); }}>
            <View style={{ flex: 1, backgroundColor: '#0f0f0f', paddingTop: 40 }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' }}>
                <TouchableOpacity onPress={() => { setScheduleVisible(false); setScheduleConfigVisible(false); setScheduledDays(new Set()); }}>
                  <Text style={{ color: '#9ad9e6', fontSize: 18 }}>✕ Close</Text>
                </TouchableOpacity>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>📅 Schedule</Text>
                <TouchableOpacity onPress={() => setScheduleConfigVisible(!scheduleConfigVisible)}>
                  <Text style={{ color: '#27d1ff', fontSize: 18 }}>{scheduleConfigVisible ? 'Hide' : 'Settings'}</Text>
                </TouchableOpacity>
              </View>

              {!scheduleConfigVisible ? (
                <ScrollView style={{ flex: 1, padding: 16 }}>
                  {/* Month/Year Navigation */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => setSelectedScheduleDate(new Date(selectedScheduleDate.getFullYear(), selectedScheduleDate.getMonth() - 1, 1))}>
                      <Text style={{ color: '#27d1ff', fontSize: 20 }}>◀</Text>
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                      {selectedScheduleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedScheduleDate(new Date(selectedScheduleDate.getFullYear(), selectedScheduleDate.getMonth() + 1, 1))}>
                      <Text style={{ color: '#27d1ff', fontSize: 20 }}>▶</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Day Headers */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <Text key={day} style={{ color: '#9ad9e6', fontWeight: 'bold', width: '14.2%', textAlign: 'center' }}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  {/* Calendar Grid */}
                  <View style={{ backgroundColor: '#1c1c1c', borderRadius: 10, padding: 8 }}>
                    {Array.from({ length: Math.ceil((getDaysInMonth(selectedScheduleDate) + getFirstDayOfMonth(selectedScheduleDate)) / 7) }).map((_, weekIdx) => (
                      <View key={weekIdx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                          const dayNumber = weekIdx * 7 + dayIdx - getFirstDayOfMonth(selectedScheduleDate) + 1;
                          const isValidDay = dayNumber > 0 && dayNumber <= getDaysInMonth(selectedScheduleDate);
                          const dateKey = `${selectedScheduleDate.getFullYear()}-${selectedScheduleDate.getMonth()}-${dayNumber}`;
                          const isToday = dayNumber === new Date().getDate() && selectedScheduleDate.getMonth() === new Date().getMonth();
                          const isSelected = scheduledDays.has(dateKey);

                          return (
                            <TouchableOpacity
                              key={`${weekIdx}-${dayIdx}`}
                              onPress={() => isValidDay && toggleScheduleDay(dayNumber)}
                              style={{
                                width: '14.2%',
                                aspectRatio: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: isSelected ? '#27d1ff' : isToday ? '#333' : 'transparent',
                                borderRadius: 8,
                                borderWidth: isToday && !isSelected ? 2 : 0,
                                borderColor: '#27d1ff',
                              }}
                            >
                              {isValidDay ? (
                                <>
                                  <Text style={{ color: isSelected ? '#000' : '#fff', fontWeight: 'bold' }}>{dayNumber}</Text>
                                  {isSelected && <Text style={{ color: '#000', fontSize: 10 }}>✓</Text>}
                                </>
                              ) : null}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>

                  <Text style={{ color: '#9ad9e6', marginTop: 16, fontSize: 12, textAlign: 'center' }}>
                    {scheduledDays.size > 0 ? `${scheduledDays.size} day(s) selected` : 'Select days to schedule irrigation'}
                  </Text>
                </ScrollView>
              ) : (
                <ScrollView style={{ flex: 1, padding: 16 }}>
                  {/* Schedule Configuration Panel */}
                  <Text style={{ color: '#9ad9e6', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>⚙️ Schedule Settings</Text>

                  <Text style={{ color: '#ccc', marginBottom: 8 }}>Start Time</Text>
                  <View style={{ flexDirection: 'row', backgroundColor: '#1c1c1c', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
                    <Picker
                      selectedValue={parseInt(scheduleStartTime.split(':')[0])}
                      onValueChange={(h: number) => setScheduleStartTime(`${String(h).padStart(2, '0')}:${scheduleStartTime.split(':')[1]}`)}
                      style={{ flex: 1, height: 120, color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: 16 }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} color="#fff" />
                      ))}
                    </Picker>
                    <Picker
                      selectedValue={parseInt(scheduleStartTime.split(':')[1])}
                      onValueChange={(m: number) => setScheduleStartTime(`${scheduleStartTime.split(':')[0]}:${String(m).padStart(2, '0')}`)}
                      style={{ flex: 1, height: 120, color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: 16 }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} color="#fff" />
                      ))}
                    </Picker>
                  </View>

                  <Text style={{ color: '#ccc', marginBottom: 8 }}>End Time</Text>
                  <View style={{ flexDirection: 'row', backgroundColor: '#1c1c1c', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
                    <Picker
                      selectedValue={parseInt(scheduleEndTime.split(':')[0])}
                      onValueChange={(h: number) => setScheduleEndTime(`${String(h).padStart(2, '0')}:${scheduleEndTime.split(':')[1]}`)}
                      style={{ flex: 1, height: 120, color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: 16 }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} color="#fff" />
                      ))}
                    </Picker>
                    <Picker
                      selectedValue={parseInt(scheduleEndTime.split(':')[1])}
                      onValueChange={(m: number) => setScheduleEndTime(`${scheduleEndTime.split(':')[0]}:${String(m).padStart(2, '0')}`)}
                      style={{ flex: 1, height: 120, color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: 16 }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} color="#fff" />
                      ))}
                    </Picker>
                  </View>

                  <Text style={{ color: '#ccc', marginBottom: 8 }}>Repeat</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    {(['once', 'daily', 'weekly'] as const).map((repeatType, index) => (
                      <TouchableOpacity
                        key={repeatType}
                        onPress={() => setScheduleRepeat(repeatType)}
                        style={{ flex: 1, paddingVertical: 10, backgroundColor: scheduleRepeat === repeatType ? '#27d1ff' : '#1c1c1c', borderRadius: 8, alignItems: 'center', marginHorizontal: index !== 2 ? 4 : 0 }}
                      >
                        <Text style={{ color: scheduleRepeat === repeatType ? '#f3efefff' : '#fff', fontWeight: 'bold' }}>
                          {repeatType.charAt(0).toUpperCase() + repeatType.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.primaryBtn} onPress={saveScheduleConfig}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓ Save Schedule</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </Modal>

          <Modal visible={timerVisible} animationType="slide" onRequestClose={() => setTimerVisible(false)}>
            <View style={{ flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'space-between', paddingTop: 40, paddingBottom: 20 }}>
              {/* Header */}
              <TouchableOpacity style={{ paddingHorizontal: 16, paddingBottom: 16 }} onPress={() => setTimerVisible(false)}>
                <Text style={{ color: '#9ad9e6', fontSize: 18 }}>✕ Close</Text>
              </TouchableOpacity>

              {/* Main Timer Display */}
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {!timerActive ? (
                  <>
                    <Text style={{ color: '#9ad9e6', fontSize: 16, marginBottom: 20 }}>⏰ Set Irrigation Duration</Text>
                    <View style={{ backgroundColor: '#1c1c1c', borderRadius: 20, padding: 20, marginBottom: 20 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#9ad9e6', fontWeight: 'bold', marginBottom: 8 }}>Hours</Text>
                          <Picker
                            selectedValue={timerDatePicker.getHours()}
                            onValueChange={(h: number) => {
                              const newDate = new Date(timerDatePicker);
                              newDate.setHours(h);
                              setTimerDatePicker(newDate);
                            }}
                            style={{ height: 200, width: 100, color: '#fff' }}
                            itemStyle={{ color: '#fff', fontSize: 24, fontWeight: '600' }}
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} color="#fff" />
                            ))}
                          </Picker>
                        </View>
                        <Text style={{ color: '#27d1ff', fontSize: 32, fontWeight: 'bold' }}>:</Text>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#9ad9e6', fontWeight: 'bold', marginBottom: 8 }}>Minutes</Text>
                          <Picker
                            selectedValue={timerDatePicker.getMinutes()}
                            onValueChange={(m: number) => {
                              const newDate = new Date(timerDatePicker);
                              newDate.setMinutes(m);
                              setTimerDatePicker(newDate);
                            }}
                            style={{ height: 200, width: 100, color: '#fff' }}
                            itemStyle={{ color: '#fff', fontSize: 24, fontWeight: '600' }}
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} color="#fff" />
                            ))}
                          </Picker>
                        </View>
                        <Text style={{ color: '#27d1ff', fontSize: 32, fontWeight: 'bold' }}>:</Text>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#9ad9e6', fontWeight: 'bold', marginBottom: 8 }}>Seconds</Text>
                          <Picker
                            selectedValue={timerDatePicker.getSeconds()}
                            onValueChange={(s: number) => {
                              const newDate = new Date(timerDatePicker);
                              newDate.setSeconds(s);
                              setTimerDatePicker(newDate);
                            }}
                            style={{ height: 200, width: 100, color: '#fff' }}
                            itemStyle={{ color: '#fff', fontSize: 24, fontWeight: '600' }}
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} color="#fff" />
                            ))}
                          </Picker>
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ color: '#9ad9e6', fontSize: 14, marginBottom: 20 }}>Irrigation in Progress</Text>
                    <Text style={{ color: '#27d1ff', fontSize: 72, fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}:
                      {String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0')}:
                      {String(timerSeconds % 60).padStart(2, '0')}
                    </Text>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: timerActive ? '#666' : '#27d1ff',
                    paddingVertical: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginRight: 6,
                  }}
                  onPress={timerActive ? cancelTimer : startIrrigationTimer}
                >
                  <Text style={{ color: timerActive ? '#ccc' : '#000', fontWeight: 'bold', fontSize: 16 }}>
                    {timerActive ? '⏹ Stop' : '▶ Start'}
                  </Text>
                </TouchableOpacity>
                {timerActive && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#666',
                      paddingVertical: 16,
                      borderRadius: 10,
                      alignItems: 'center',
                    }}
                    onPress={cancelTimer}
                  >
                    <Text style={{ color: '#ccc', fontWeight: 'bold', fontSize: 16 }}>✕ Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>

          {/* Notification Center Modal */}
          <Modal visible={notificationCenterVisible} animationType="fade" transparent onRequestClose={() => setNotificationCenterVisible(false)}>
            <View style={styles.overlayBackdrop}>
              <View style={styles.overlayPanel}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>🔔 Notification Center</Text>
                  <TouchableOpacity onPress={() => setNotificationCenterVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
                  {getFormattedAlerts().length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No alerts yet. System is running smoothly! ✓</Text>
                    </View>
                  ) : (
                    getFormattedAlerts().map((section, idx) => (
                      <View key={idx} style={styles.alertSection}>
                        <Text style={styles.alertSectionTitle}>{section.date}</Text>
                        {section.alerts.map((alert, alertIdx) => (
                          <View key={alertIdx} style={[styles.notificationItemImproved, { borderLeftColor: alert.type === 'critical' ? '#ff6b6b' : alert.type === 'warning' ? '#ffd93d' : '#6dd5ff' }]}>
                            <Text style={[styles.notificationBadge, { backgroundColor: alert.type === 'critical' ? '#ff6b6b' : alert.type === 'warning' ? '#ffd93d' : '#6dd5ff', color: alert.type === 'critical' ? '#fff' : '#000' }]}>
                              {alert.type.toUpperCase()}
                            </Text>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{alert.message}</Text>
                              <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{new Date(alert.timestamp).toLocaleTimeString()}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Alerts & Notifications Settings Modal */}
          <Modal visible={alertSettingsVisible} animationType="fade" transparent onRequestClose={() => setAlertSettingsVisible(false)}>
            <View style={styles.overlayBackdrop}>
              <View style={styles.overlayPanel}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>🚨 Alerts & Notifications</Text>
                  <TouchableOpacity onPress={() => setAlertSettingsVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
                  {/* Water Level Alert */}
                  <View style={styles.settingsCard}>
                    <View style={styles.settingHeaderRow}>
                      <Text style={styles.settingsLabel}>💧 Minimum Water Level</Text>
                      <TouchableOpacity onPress={() => setWaterLevelAlertEnabled(!waterLevelAlertEnabled)}>
                        <Text style={{ fontSize: 24, color: waterLevelAlertEnabled ? '#27d1ff' : '#666' }}>
                          {waterLevelAlertEnabled ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {waterLevelAlertEnabled && (
                      <View style={styles.settingControlsContainer}>
                        <Text style={styles.settingValue}>Alert Threshold: {minWaterLevel}%</Text>
                        <View style={styles.controlRow}>
                          <TouchableOpacity style={styles.volumeBtn} onPress={() => setMinWaterLevel(Math.max(0, minWaterLevel - 5))}>
                            <Text style={styles.volumeBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.settingValueCenter}>{minWaterLevel}%</Text>
                          <TouchableOpacity style={styles.volumeBtn} onPress={() => setMinWaterLevel(Math.min(100, minWaterLevel + 5))}>
                            <Text style={styles.volumeBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Maximum Temperature Alert */}
                  <View style={styles.settingsCard}>
                    <View style={styles.settingHeaderRow}>
                      <Text style={styles.settingsLabel}>🔥 Maximum Temperature</Text>
                      <TouchableOpacity onPress={() => setMaxTempAlertEnabled(!maxTempAlertEnabled)}>
                        <Text style={{ fontSize: 24, color: maxTempAlertEnabled ? '#27d1ff' : '#666' }}>
                          {maxTempAlertEnabled ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {maxTempAlertEnabled && (
                      <View style={styles.settingControlsContainer}>
                        <Text style={styles.settingValue}>Alert Threshold: {maxTemp}°C</Text>
                        <View style={styles.controlRow}>
                          <TouchableOpacity style={styles.volumeBtn} onPress={() => setMaxTemp(Math.max(0, maxTemp - 5))}>
                            <Text style={styles.volumeBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.settingValueCenter}>{maxTemp}°C</Text>
                          <TouchableOpacity style={styles.volumeBtn} onPress={() => setMaxTemp(Math.min(50, maxTemp + 5))}>
                            <Text style={styles.volumeBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Minimum Temperature Alert */}
                  <View style={styles.settingsCard}>
                    <View style={styles.settingHeaderRow}>
                      <Text style={styles.settingsLabel}>❄️ Minimum Temperature</Text>
                      <TouchableOpacity onPress={() => setMinTempAlertEnabled(!minTempAlertEnabled)}>
                        <Text style={{ fontSize: 24, color: minTempAlertEnabled ? '#27d1ff' : '#666' }}>
                          {minTempAlertEnabled ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {minTempAlertEnabled && (
                      <View style={styles.settingControlsContainer}>
                        <Text style={styles.settingValue}>Alert Threshold: {minTemp}°C</Text>
                        <View style={styles.controlRow}>
                          <TouchableOpacity style={styles.volumeBtn} onPress={() => setMinTemp(Math.max(0, minTemp - 5))}>
                            <Text style={styles.volumeBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.settingValueCenter}>{minTemp}°C</Text>
                          <TouchableOpacity style={styles.volumeBtn} onPress={() => setMinTemp(Math.min(50, minTemp + 5))}>
                            <Text style={styles.volumeBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  <Text style={{ color: '#999', fontSize: 12, marginTop: 16, textAlign: 'center', paddingHorizontal: 16 }}>
                    Alerts will be logged and notified when thresholds are reached
                  </Text>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Cooling Automation Settings Modal */}
          <Modal visible={coolingSettingsVisible} animationType="fade" transparent onRequestClose={() => setCoolingSettingsVisible(false)}>
            <View style={styles.overlayBackdrop}>
              <View style={styles.overlayPanel}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>❄️ Cooling Automation</Text>
                  <TouchableOpacity onPress={() => setCoolingSettingsVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.settingsCard}>
                    <Text style={styles.settingsLabel}>Current Temperature</Text>
                    <Text style={styles.settingsValue}>{temp}°C</Text>

                    <Text style={styles.infoText}>
                      When temperature reaches the trigger point, the system automatically activates the sprinkler in Automatic mode.
                    </Text>

                    <View style={styles.settingSection}>
                      <Text style={styles.settingLabel}>Trigger Temperature: {coolingTriggerTemp}°C</Text>
                      <View style={styles.controlRow}>
                        <TouchableOpacity style={styles.volumeBtn} onPress={() => setCoolingTriggerTemp(Math.max(0, coolingTriggerTemp - 5))}>
                          <Text style={styles.volumeBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.settingValueCenter}>{coolingTriggerTemp}°C</Text>
                        <TouchableOpacity style={styles.volumeBtn} onPress={() => setCoolingTriggerTemp(Math.min(50, coolingTriggerTemp + 5))}>
                          <Text style={styles.volumeBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.statusBox}>
                      <Text style={styles.statusLabel}>
                        ℹ️ Status: {isCooling ? '🟢 Cooling Active' : '⚪ Cooling Inactive'}
                      </Text>
                      <Text style={styles.statusDetail}>
                        {temp >= coolingTriggerTemp ? `⚠️ Temperature at or above trigger (${temp}°C ≥ ${coolingTriggerTemp}°C)` : `✓ Temperature within safe range (${temp}°C < ${coolingTriggerTemp}°C)`}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Water Refill Settings Modal */}
          <Modal visible={refillSettingsVisible} animationType="fade" transparent onRequestClose={() => setRefillSettingsVisible(false)}>
            <View style={styles.overlayBackdrop}>
              <View style={styles.overlayPanel}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>💧 Water Refill Settings</Text>
                  <TouchableOpacity onPress={() => setRefillSettingsVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.settingsCard}>
                    <Text style={styles.settingsLabel}>Current Level</Text>
                    <Text style={styles.settingsValue}>{water}%</Text>

                    <Text style={styles.infoText}>
                      When water level drops to the refill point, the main source valve automatically opens to refill the tank.
                    </Text>

                    <View style={styles.settingSection}>
                      <Text style={styles.settingLabel}>Refill Point: {refillPoint}%</Text>
                      <View style={styles.controlRow}>
                        <TouchableOpacity style={styles.volumeBtn} onPress={() => setRefillPoint(Math.max(0, refillPoint - 5))}>
                          <Text style={styles.volumeBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.settingValueCenter}>{refillPoint}%</Text>
                        <TouchableOpacity style={styles.volumeBtn} onPress={() => setRefillPoint(Math.min(refillMaxPoint, refillPoint + 5))}>
                          <Text style={styles.volumeBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.settingSection}>
                      <Text style={styles.settingLabel}>Stop Refill At: {refillMaxPoint}%</Text>
                      <View style={styles.controlRow}>
                        <TouchableOpacity style={styles.volumeBtn} onPress={() => setRefillMaxPoint(Math.max(refillPoint, refillMaxPoint - 5))}>
                          <Text style={styles.volumeBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.settingValueCenter}>{refillMaxPoint}%</Text>
                        <TouchableOpacity style={styles.volumeBtn} onPress={() => setRefillMaxPoint(Math.min(100, refillMaxPoint + 5))}>
                          <Text style={styles.volumeBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.statusBox}>
                      <Text style={styles.statusLabel}>
                        ℹ️ Status: {isRefilling ? '🟢 Refilling Active' : '⚪ Refilling Inactive'}
                      </Text>
                      <Text style={styles.statusDetail}>
                        {water <= refillPoint ? `⚠️ Water low! Ready to refill (${water}% ≤ ${refillPoint}%)` : `✓ Water level sufficient (${water}% > ${refillPoint}%)`}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#0f0f0f' },
  
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
  
  // Main Container
  main: { flex: 1, backgroundColor: '#0f0f0f' },
  
  // Top Bar
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1c1c1c', backgroundColor: '#0f0f0f' },
  
  // Cards Layout
  cards: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 } as any,
  card: { backgroundColor: '#1c1c1c', padding: 16, borderRadius: 12, width: '48%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardTitle: { color: '#9ad9e6', fontSize: 16, marginBottom: 8, fontWeight: '600' },
  circle: { width: 70, height: 70, borderRadius: 35, borderWidth: 6, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  icon: { fontSize: 36, textAlign: 'center' },
  value: { color: '#ccc', marginTop: 8, fontSize: 12 },
  
  // Mode Controls
  modeContainer: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  modeRow: { flexDirection: 'row', marginTop: 12 },
  modeBtn: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#27d1ff', backgroundColor: '#1c1c1c', flex: 1, alignItems: 'center', marginHorizontal: 4 },
  modeActive: { backgroundColor: '#27d1ff' },
  modeActiveText: { color: '#111', fontWeight: 'bold' },
  modeBtnSmall: { paddingVertical: 6, paddingHorizontal: 8 },
  
  // Quick Actions - IMPROVED
  quickActionsContainer: { flexDirection: 'row', marginTop: 8, width: '100%', gap: 8, justifyContent: 'space-between' },
  quickActionBtn: { flex: 1, backgroundColor: '#111', padding: 10, borderRadius: 8, borderWidth: 2, borderColor: '#27d1ff', alignItems: 'center', justifyContent: 'center', minHeight: 44, shadowColor: '#27d1ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  quickActionBtnActive: { backgroundColor: '#27d1ff', borderColor: '#fff' },
  quickActionBtnText: { color: '#9ad9e6', fontWeight: '600', textAlign: 'center', fontSize: 12 },
  quickActionBtnTextActive: { color: '#0f0f0f' },
  quickActionBtnDisabled: { opacity: 0.5, backgroundColor: '#111', borderColor: '#666' },
  
  // Overlay Styles - NEW IMPROVED DESIGN
  overlayBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  overlayPanel: { backgroundColor: '#1c1c1c', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', minHeight: '50%', paddingBottom: 20 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  overlayTitle: { fontSize: 18, color: '#fff', fontWeight: '700' },
  closeBtn: { fontSize: 24, color: '#9ad9e6', fontWeight: '300' },
  overlayContent: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  
  // Settings Cards
  settingsCard: { backgroundColor: '#111', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#27d1ff' },
  settingsLabel: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  settingsValue: { color: '#27d1ff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  settingValue: { color: '#9ad9e6', fontSize: 13 },
  settingValueCenter: { color: '#27d1ff', fontSize: 18, flex: 1, textAlign: 'center', fontWeight: '600' },
  settingLabel: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  settingSection: { marginVertical: 12 },
  settingHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  settingControlsContainer: { backgroundColor: '#000', padding: 12, borderRadius: 8, marginTop: 8 },
  infoText: { color: '#9ad9e6', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  
  // Volume Controls
  volumeSlider: { width: '100%', height: 6, backgroundColor: '#111', borderRadius: 3, overflow: 'hidden', marginVertical: 12 },
  volumeFill: { height: '100%', backgroundColor: '#27d1ff', borderRadius: 3 },
  volumeControls: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  volumeBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#27d1ff', borderRadius: 6, minWidth: 48, alignItems: 'center' },
  volumeBtnText: { color: '#0f0f0f', fontWeight: '700', fontSize: 16 },
  
  // WiFi Items
  wifiItem: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#333' },
  wifiItemActive: { backgroundColor: '#27d1ff', borderColor: '#27d1ff' },
  wifiItemText: { color: '#fff', fontSize: 15 },
  wifiItemTextActive: { color: '#0f0f0f', fontWeight: '600' },
  wifiCheckmark: { color: '#0f0f0f', fontWeight: '700', fontSize: 18 },
  wifiStatus: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginTop: 12 },
  wifiStatusLabel: { color: '#9ad9e6', fontSize: 12, marginBottom: 4 },
  wifiStatusValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 40, justifyContent: 'center' },
  emptyStateText: { color: '#9ad9e6', fontSize: 16, textAlign: 'center', fontWeight: '500' },
  
  // Alert Sections
  alertSection: { marginBottom: 16 },
  alertSectionTitle: { color: '#27d1ff', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  notificationItemImproved: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'flex-start' },
  
  // Status Box
  statusBox: { backgroundColor: '#000', padding: 12, borderRadius: 8, marginTop: 16, borderLeftWidth: 3, borderLeftColor: '#27d1ff' },
  statusLabel: { color: '#27d1ff', fontSize: 13, fontWeight: '600' },
  statusDetail: { color: '#9ad9e6', fontSize: 12, marginTop: 6, lineHeight: 16 },
  
  // Control Row
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  
  // Alert Banner
  alertBanner: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  alertBannerText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  
  // Notifications
  notificationItem: { backgroundColor: '#1c1c1c', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'flex-start' },
  notificationBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 11, fontWeight: 'bold', alignSelf: 'flex-start' },
  
  // Drawer Styles
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  drawer: { flex: 1, backgroundColor: '#1c1c1c', maxWidth: 280, paddingVertical: 16, paddingHorizontal: 12, justifyContent: 'flex-start' },
  drawerBackdrop: { flex: 1 },
  drawerHeader: { alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  drawerTitle: { color: '#9ad9e6', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
  drawerItem: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 4, borderRadius: 6 },
  drawerItemText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  submenu: { backgroundColor: '#111', marginLeft: 12, borderRadius: 6, marginBottom: 4, paddingVertical: 4 },
  submenuItem: { paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  submenuItemText: { color: '#9ad9e6', fontSize: 14 },
  drawerLogout: { paddingVertical: 10, paddingHorizontal: 12, marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#333', borderRadius: 6, alignSelf: 'stretch' },
  drawerLogoutText: { color: '#ff6b6b', fontSize: 16, fontWeight: '600' },
  
  // Compact Card
  compactCard: { padding: 12, minHeight: 110 },
  
  // Full Width Card
  fullWidthCard: { width: '96%', marginHorizontal: '2%', marginVertical: 4, backgroundColor: '#1c1c1c', padding: 12, borderRadius: 12 },
  
  // Deprecated/Fallback Styles (for backward compatibility)
  container: { flexGrow: 1, padding: 20, backgroundColor: '#0f0f0f', alignItems: 'center' },
  loginContainer: { width: '100%', maxWidth: 420, backgroundColor: '#1c1c1c', padding: 20, borderRadius: 12 },
  googleBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center' },
  input: { backgroundColor: '#111', color: '#fff', borderColor: '#27d1ff', borderWidth: 1, padding: 10, borderRadius: 6, marginTop: 8 },
  primaryBtn: { backgroundColor: '#27d1ff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  secondaryBtn: { backgroundColor: '#1c1c1c', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#27d1ff' },
  settingBtn: { marginHorizontal: 16, backgroundColor: '#1c1c1c', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#27d1ff', alignItems: 'center' },
  overlay: { flex: 1, padding: 20, backgroundColor: '#0f0f0f', alignItems: 'center' },
  cardInline: { backgroundColor: '#1c1c1c', padding: 12, borderRadius: 10, width: '100%', marginBottom: 12 },
  smallBtn: { padding: 8, backgroundColor: '#27d1ff', borderRadius: 6 },
  listItem: { padding: 12, backgroundColor: '#111', borderRadius: 8, marginTop: 8, width: '100%' },
  quickActionActive: { backgroundColor: '#27d1ff', borderColor: '#fff' },
  quickActionDisabled: { opacity: 0.5, backgroundColor: '#111' },
  quickActionBtnSmall: { flex: 1, backgroundColor: '#1c1c1c', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#27d1ff', alignItems: 'center', justifyContent: 'center' },
});