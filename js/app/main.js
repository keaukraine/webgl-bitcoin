define(['bitcoinRenderer'],
    function(BitcoinRenderer) {
        $(function() {
            var bitcoinRenderer = new BitcoinRenderer();

            bitcoinRenderer.init('canvasGL');
        });
    });
