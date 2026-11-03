import { Pressable, StyleSheet, Text, View } from 'react-native'

type Props = {
  onUpdate: () => void
}

/** Full-screen, non-dismissable wall shown until the app is updated. */
export default function UpdateRequiredScreen({ onUpdate }: Props) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>আপডেট প্রয়োজন</Text>
      <Text style={styles.body}>
        অ্যাপটি ব্যবহার করতে অনুগ্রহ করে সর্বশেষ সংস্করণে আপডেট করুন।
      </Text>
      <Pressable style={styles.button} onPress={onUpdate}>
        <Text style={styles.buttonText}>এখনই আপডেট করুন</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16213e',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: '#566176',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#f5832b',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
})
