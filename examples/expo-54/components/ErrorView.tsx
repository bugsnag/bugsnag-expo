import { Button, StyleSheet, Text, View } from 'react-native';

interface Props {
    clearError: () => void
}

const ErrorView: React.FunctionComponent<Props> = ({ clearError }) => (
    <View style={styles.screenContainer}>
        <Text>Inform users of an error in the component tree.
            Use clearError to reset ErrorBoundary state and re-render child tree.</Text>
        <Button onPress={clearError} title='Reset' />
    </View>
);

export default ErrorView

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
