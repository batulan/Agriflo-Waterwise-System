import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity } from 'react-native';
import {styles} from './styles';

const agriFLOLogo = require('../assets/images/AgriFlo-logo.jpg');

type Props = {
  drawerVisible: boolean;
  setDrawerVisible: (v: boolean) => void;
  settingsExpanded: boolean;
  setSettingsExpanded: (v: boolean) => void;
  handleLogout: () => void;
  setSoundVisible: (v: boolean) => void;
  setWifiVisible: (v: boolean) => void;
  setAlertSettingsVisible: (v: boolean) => void;
  setNotificationCenterVisible: (v: boolean) => void;
};

export default function Navigation({
  drawerVisible,
  setDrawerVisible,
  settingsExpanded,
  setSettingsExpanded,
  handleLogout,
  setSoundVisible,
  setWifiVisible,
  setAlertSettingsVisible,
  setNotificationCenterVisible,
}: Props) {
  return (
    <>
      <Modal visible={drawerVisible} animationType="fade" transparent onRequestClose={() => setDrawerVisible(false)}>
        <View style={styles.drawerOverlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Image source={agriFLOLogo} style={{ width: 50, height: 50, borderRadius: 8 }} />
              <Text style={styles.drawerTitle}>Agriflo Waterwise System</Text>
            </View>

            <TouchableOpacity style={styles.drawerItem} onPress={() => setDrawerVisible(false)}>
              <Text style={styles.drawerItemText}>📊 Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => setDrawerVisible(false)}>
              <Text style={styles.drawerItemText}>👤 Account</Text>
            </TouchableOpacity>

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

            <TouchableOpacity style={styles.drawerLogout} onPress={handleLogout}>
              <Text style={styles.drawerLogoutText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerVisible(false)} />
        </View>
      </Modal>

      <View style={[styles.topbar, { paddingTop: 12, marginTop: 8 }]}> 
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Text style={{ color: '#9ad9e6', fontSize: 28 }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Dashboard</Text>
        <TouchableOpacity onPress={() => setNotificationCenterVisible(true)}>
          <Text style={{ color: '#ff6b6b', fontSize: 24 }}>🔔</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}