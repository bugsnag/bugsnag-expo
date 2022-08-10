import withRemoveiOSNotificationEntitlement from "./config-plugins/withRemoveiOSNotificationEntitlement";

export default (config) => {
    return {
        ...config,
        plugins: [
            ...(config.plugins ?? []),
            [withRemoveiOSNotificationEntitlement]
        ]
    }
}
