import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { TRANSACTION_CATEGORY_CHOICES } from "./constants";

type CategoryPickerModalProps = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (category: string) => void;
};

export function CategoryPickerModal({
  visible,
  value,
  onClose,
  onSelect,
}: CategoryPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-950/80">
        <View className="max-h-[75%] rounded-t-[2.25rem] border border-white/10 bg-slate-950 px-5 pb-7 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-white">Select category</Text>
            <Pressable onPress={onClose} className="rounded-xl bg-white/10 px-3 py-2">
              <Text className="font-semibold text-white">Close</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-2">
            {TRANSACTION_CATEGORY_CHOICES.map(([category, label]) => {
              const selected = category === value;
              return (
                <Pressable
                  key={category}
                  className={`rounded-2xl border px-4 py-4 ${selected ? "border-cyan-400 bg-cyan-400/15" : "border-white/10 bg-slate-900"}`}
                  onPress={() => {
                    onSelect(category);
                    onClose();
                  }}
                >
                  <Text className={`text-base font-semibold ${selected ? "text-cyan-200" : "text-white"}`}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
