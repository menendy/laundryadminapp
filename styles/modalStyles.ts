// src/styles/modalStyles.ts
import { StyleSheet } from "react-native";

export const modalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 18,
        paddingTop: 6,
    },

    header: {
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        marginBottom: 8,
    },

    headerTitle: {
        fontWeight: "700",
        fontSize: 18,
    },

    closeBtn: {
        position: "absolute",
        right: 0,
        top: -6,
    },

    saveBtn: {
        borderRadius: 10,
        marginTop: 12,
    },

    item: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    activeItem: {
        backgroundColor: "#e8f0fe",
    },

    empty: {
        textAlign: "center",
        marginTop: 30,
        color: "#888",
    },
});
