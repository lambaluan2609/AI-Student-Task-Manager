import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const COURSES = ['Mathematics', 'Physics', 'History', 'Literature', 'Chemistry', 'Computer Science'];
const PRIORITIES = ['high', 'medium', 'low'];

export default function EditTaskModal({ visible, onClose, task, onSave }) {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCourse(task.course);
      setPriority(task.priority);
      setDueDate(task.dueDate);
    }
  }, [task]);

  const handleSave = () => {
    if (!title || !course || !priority) return;
    onSave({ ...task, title, course, priority, dueDate });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Task</Text>

          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Course</Text>
          <View style={styles.optionsContainer}>
            {COURSES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.optionButton, course === c && styles.selectedOption]}
                onPress={() => setCourse(c)}
              >
                <Text style={[styles.optionText, course === c && styles.selectedOptionText]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.selectedPriority,
                  {
                    backgroundColor:
                      priority === p
                        ? p === 'high'
                          ? '#FF3B30'
                          : p === 'medium'
                          ? '#FF9500'
                          : '#34C759'
                        : '#f0f0f0',
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[styles.priorityText, priority === p && styles.selectedPriorityText]}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Due Date</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{dueDate.toLocaleDateString()}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  selectedOption: { backgroundColor: '#007AFF' },
  optionText: { color: '#666' },
  selectedOptionText: { color: 'white' },
  priorityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  priorityButton: { flex: 1, marginHorizontal: 4, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  selectedPriority: { backgroundColor: '#007AFF' },
  priorityText: { fontWeight: '600', color: '#666' },
  selectedPriorityText: { color: 'white' },
  dateButton: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 20 },
  dateButtonText: { fontSize: 16, color: '#333', textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  saveButton: { backgroundColor: '#007AFF' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  saveButtonText: { color: 'white' },
});