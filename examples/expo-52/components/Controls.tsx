import Bugsnag from '@bugsnag/expo';
import React from 'react';
import { View } from 'react-native';
import Button from './Button';

function unhandledError() {
    throw new Error('Unhandled error!');
}

function handledError() {
    Bugsnag.notify(new Error('Handled error!'));
}

const Controls = () => {
    const [yeah, setYeah] = React.useState(false);

    const triggerRenderError = () => {
        setYeah(true)
    }

    return (
        <View>
            <Button onPress={handledError} title='Handled error' />
            <Button onPress={unhandledError} title='Unhandled error' />
            <Button onPress={triggerRenderError} title='Render error' />
            {/* @ts-expect-error This will throw an error because the property doesn't exist */}
            {yeah ? <span>{yeah.non.existent.property}</span> : null}
        </View>
    )
}

export default Controls
