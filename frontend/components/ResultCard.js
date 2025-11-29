export default function ResultCard({result}) {
  // Handle both old and new result formats
  const isCombinedResult = result.hasOwnProperty('input_text');
  
  if (isCombinedResult) {
    return (
      <div className="holo p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-neon-blue text-xl font-bold mb-2">AI Recommendation</div>
            <div className="text-gray-400">ML Classification: {result.category} | Urgency: {result.urgency}</div>
            {result.image_detections && result.image_detections.length > 0 && (
              <div className="text-gray-400 mt-1">Image Severity: {result.image_severity}</div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-neon-blue/10 rounded">
          {result.recommended_action}
        </div>

        {result.annotated_image && (
          <div className="mt-6">
            <div className="text-neon-blue font-bold mb-2">Detected Image</div>
            <img
              src={`http://localhost:8002${result.annotated_image}`}
              className="w-full rounded-lg mt-2"
            />
          </div>
        )}

        {result.image_detections && result.image_detections.length > 0 && (
          <div className="mt-6">
            <div className="text-neon-blue font-bold mb-2">Image Detections</div>
            <div className="space-y-3">
              {result.image_detections.map((d, i) => (
                <div key={i} className="holo p-3">
                  <div className="font-bold">{d.label}</div>
                  <div className="text-gray-400">Confidence: {d.confidence}</div>
                  <div className="text-gray-400 text-sm">Bounding Box: [{d.bbox.join(', ')}]</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="text-neon-blue font-bold mb-2">Retrieved snippets</div>
          <div className="space-y-3">
            {result.retrieved.map((r, i) => (
              <div key={i} className="holo p-3">
                <div className="text-gray-400"><b>Source:</b> {r.source}</div>
                <div className="mt-2 p-3 bg-neon-blue/5 rounded">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    // Handle old format (for history items)
    return (
      <div className="holo p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-neon-blue text-xl font-bold mb-2">AI Recommendation</div>
            <div className="text-gray-400">Source snippets are shown below for transparency.</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-neon-blue/10 rounded">
          {result.answer || result.recommended_action}
        </div>

        <div className="mt-6">
          <div className="text-neon-blue font-bold mb-2">Retrieved snippets</div>
          <div className="space-y-3">
            {result.retrieved.map((r, i) => (
              <div key={i} className="holo p-3">
                <div className="text-gray-400"><b>Source:</b> {r.source}</div>
                <div className="mt-2 p-3 bg-neon-blue/5 rounded">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}