import withRemoveiOSNotificationEntitlement from "./config-plugins/withRemoveiOSNotificationEntitlement";

export default config => {
    return {
        expo: {
            ...config,
            plugins: [
                [withRemoveiOSNotificationEntitlement]
            ]
        }
    }
}
