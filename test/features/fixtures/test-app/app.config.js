import withRemoveiOSNotificationEntitlement from "./config-plugins/withRemoveiOSNotificationEntitlement";

export default (config) => {
    console.log(config)
    newConfig = {
        ...config,
        plugins: [
            [withRemoveiOSNotificationEntitlement]
        ]
    }
    console.log(newConfig)
    return newConfig
}
