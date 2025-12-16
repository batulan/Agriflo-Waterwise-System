import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
