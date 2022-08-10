import withRemoveiOSNotificationEntitlement from "./config-plugins/withRemoveiOSNotificationEntitlement";

export default (config) => {
    console.log(config)
    return {
        ...config,
        plugins: [
            [withRemoveiOSNotificationEntitlement]
        ]
    }
}
