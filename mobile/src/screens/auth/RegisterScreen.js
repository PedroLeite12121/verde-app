import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNasc, setDataNasc] = useState('');

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !cpf || !dataNasc) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    const result = await signUp(name, email, password, cpf, dataNasc);

    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  };

  const formatCPF = (value) => {
  return value
    .replace(/\D/g, '') 
    .replace(/(\d{3})(\d)/, '$1.$2') 
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2') 
    .slice(0, 14); 
  };

  const formatData = (value) => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{2})(\d)/, '$1/$2') // Coloca barra após os 2 primeiros dígitos (dia)
    .replace(/(\d{2})(\d)/, '$1/$2') // Coloca barra após os 2 dígitos seguintes (mês)
    .slice(0, 10); // Limita ao tamanho máximo (DD/MM/AAAA)
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se ao movimento +Verde</Text>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Nome completo" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={cpf}
            onChangeText={(text) => setCpf(formatCPF(text))}
            keyboardType="numeric"
            maxLength={14}
          />

          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={dataNasc}
            onChangeText={(text) => setDataNasc(formatData(text))}
            keyboardType="numeric"
            maxLength={10}
          />

          <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Criando...' : 'Criar Conta'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Já tenho conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2D6A4F', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { width: '100%' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#2D6A4F', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
