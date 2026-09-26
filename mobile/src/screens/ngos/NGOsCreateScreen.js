import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import api from '../../api';
import { AppHeader } from '../../components/ui';
import { COLORS } from '../../theme';

export default function NGOsCreateScreen() {
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [regiao, setRegiao] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sending, setSending] = useState(false);

  const handleCreateOng = async () => {
    if (!nome.trim() || !regiao.trim() || !cnpj.trim() || !telefone.trim() || !descricao.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha o nome, a região, CNPJ, telefone e descrição da ONG.',
      );
      return;
    }

    setSending(true);

    try {
      await api.post('/ongs', {
        nome: nome.trim(),
        regiao: regiao.trim(),
        cnpj: cnpj.replace(/\D/g, ''),
        telefone: telefone.replace(/\D/g, ''),
        descricao: descricao.trim()
      });

      Alert.alert(
        'Solicitação enviada',
        'Sua solicitação de criação de ONG foi encaminhada para análise.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        'Erro',
        err.response?.data?.error ||
          'Não foi possível enviar a solicitação.',
      );
    } finally {
      setSending(false);
    }
  };

  const formatCnpj = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);

    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const formatTelefone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Cadastrar ONG" subtitle="Envie sua solicitação" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <View style={styles.icon}>
            <Ionicons name="people-outline" size={26} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Cadastro de ONG</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo. A solicitação será analisada pela
            administração.
          </Text>
        </View>

        <Text style={styles.label}>Nome da ONG *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Instituto Verde"
          placeholderTextColor={COLORS.faint}
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Região de atuação *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Cidade Tiradentes"
          placeholderTextColor={COLORS.faint}
          value={regiao}
          onChangeText={setRegiao}
          autoCapitalize="words"
        />

        <Text style={styles.label}>CNPJ *</Text>
        <TextInput
          style={styles.input}
          placeholder="00.000.000/0000-00"
          placeholderTextColor={COLORS.faint}
          value={cnpj}
          onChangeText={(value) => setCnpj(formatCnpj(value))}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Telefone *</Text>
        <TextInput
          style={styles.input}
          placeholder="(11) 99999-9999"
          placeholderTextColor={COLORS.faint}
          value={telefone}
          onChangeText={(value) => setTelefone(formatTelefone(value))}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Descrição da ONG *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Conte um pouco sobre a ONG e seu trabalho..."
          placeholderTextColor={COLORS.faint}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submit, sending && styles.submitDisabled]}
          onPress={handleCreateOng}
          disabled={sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={styles.submitText}>Enviar solicitação</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancel}
          onPress={() => navigation.goBack()}
          disabled={sending}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    alignItems: 'center',
    marginBottom: 18,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2E9',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 13,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancel: {
    alignItems: 'center',
    padding: 16,
  },
  cancelText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: '600',
  },
});