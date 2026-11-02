import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    onPress: () => void
    title: string
}

const Button: React.FunctionComponent<Props> = ({ onPress, title }) => (
    <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onPress} >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    </View>
);

export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#003366',
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        letterSpacing: 0.25,
        color: 'white',
    },
    buttonContainer: {
        paddingVertical: 10,
    }
});
