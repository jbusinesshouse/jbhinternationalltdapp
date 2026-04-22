import React, { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'

interface RichTextEditorProps {
  value: string
  onChange: (text: string) => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const richText = useRef<RichEditor>(null)

  return (
    <View style={styles.container}>
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          // actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.insertOrderedList,
        ]}
        iconTint="#555"
        selectedIconTint="#007bff"
        selectedButtonStyle={{ backgroundColor: '#e0f0ff' }}
      />
      <RichEditor
        ref={richText}
        style={styles.editor}
        initialContentHTML={value}
        onChange={onChange}
        placeholder="Enter description..."
      />
    </View>
  )
}

export default RichTextEditor

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
  },
  editor: {
    // minHeight: 150,
    // padding: 10,
  },
})